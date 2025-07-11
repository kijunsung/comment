import { useEffect, useState, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  getUserProfile,
  updateUserProfile,
  getUserIdByUsername,
} from '../../services/userApi';
import { UserResponse, UserUpdateRequest } from '../../types/user';
import { AuthContext } from '../../context/AuthContext';
import { CenterFocusStrong } from '@mui/icons-material';

const Mypage = () => {
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState<UserUpdateRequest>({
    username: '',
    name: '',
    email: '',
    phone: '',
    nickname: '',
    password: '',
  });

  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const username = payload.sub;

      if (!username) {
        setError('유효하지 않은 사용자입니다.');
        setLoading(false);
        return;
      }

      getUserIdByUsername(username)
        .then((userId) => getUserProfile(userId))
        .then((data) => {
          setUser(data);
          setForm(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('사용자 정보를 불러오는데 실패했습니다.');
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
      setError('토큰 파싱 오류');
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token || !user) return;

    try {
      const updatedUser = await updateUserProfile(user.userId, form);
      setUser(updatedUser);
      setIsEditing(false);
      alert('정보가 성공적으로 수정되었습니다!');
    } catch (err) {
      console.error(err);
      alert('수정 실패');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: '700px',
        width: '100%',
        mx: 'auto',
        mt: 5,
        p: 3,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: 'white',
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
          gutterBottom
          sx={{ mb: 2 ,textAlign:'center'}}
          
        >
          마이페이지
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {user && !isEditing && (
          <Stack spacing={2}>
            <Typography>
              <strong>User Name:</strong> {user.username}
            </Typography>
            <Typography>
              <strong>이름:</strong> {user.name}
            </Typography>
            <Typography>
              <strong>닉네임:</strong> {user.nickname}
            </Typography>
            <Typography>
              <strong>이메일:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>폰번호:</strong> {user.phone}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
              sx={{ mt: 2, borderRadius: 8, px: 3 }}
            >
              ✏️ 회원정보 수정
            </Button>
          </Stack>
        )}

        {user && isEditing && (
          <Box component="form" noValidate autoComplete="off">
            <Stack spacing={2}>
              <Typography variant="subtitle1" color="text.secondary">
                User Name: {user.username}
              </Typography>
              <TextField
                label="이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                size="medium"
              />
              <TextField
                label="닉네임"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                fullWidth
                size="medium"
              />
              <TextField
                label="이메일"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                size="medium"
                type="email"
              />
              <TextField
                label="폰번호"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                size="medium"
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSave}
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  ✅ 저장
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsEditing(false)}
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  ❌ 취소
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Mypage;
