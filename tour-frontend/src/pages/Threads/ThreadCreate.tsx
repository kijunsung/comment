
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThread } from '../../services/threadApi'; // 게시글 작성 API 호출 함수
import { AuthContext } from '../../context/AuthContext'; // 로그인 정보 context
import { Box, Button, TextField, Typography } from '@mui/material';

const ThreadCreate = () => {
  // 게시글 작성 폼 상태: 제목, 내용, PDF 경로, 여행 지역
  const [form, setForm] = useState({
    title: '',
    content: '',
    pdfPath: '',
    area: '',
  });

  // 로그인한 사용자 정보 context에서 가져오기
  const { user } = useContext(AuthContext);

  // 페이지 이동 함수
  const navigate = useNavigate();

  // 폼 입력 변경 시 호출됨 (input, textarea 공통)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // 기존 상태를 복사한 뒤 변경된 항목만 업데이트
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 폼 제출 시 호출되는 함수 (게시글 작성 요청 처리)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 이벤트 막음(새로고침 방지)

    // 로그인 여부 확인
    if (!user) {
      alert('로그인 후 게시글을 작성할 수 있습니다.');
      return;
    }

    // 제목, 내용 필수 체크
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      // API에 userId, author 추가하여 작성 요청
      await createThread({
        ...form,
        userId: user.userId,
        author: user.username,
      });

      // 작성 성공 시 게시글 목록 페이지로 이동
      navigate('/thread');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box
  sx={{
    maxWidth: 1140, // 💡 960 → 1140 으로 더 넓게 설정
    margin: '2rem auto',
    padding: '2.5rem',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  }}
>
      <Typography variant="h4" sx={{ marginBottom: '1.5rem', color: '#1976d2', fontWeight: 'bold' }}>
        ✍️ 게시글 작성
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <TextField
          label="제목"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          fullWidth
        />

        <TextField
          label="내용"
          name="content"
          value={form.content}
          onChange={handleChange}
          required
          multiline
          rows={8}
          fullWidth
        />

        <TextField
          label="첨부할 PDF 경로 (선택)"
          name="pdfPath"
          value={form.pdfPath}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="여행 지역 (선택)"
          name="area"
          value={form.area}
          onChange={handleChange}
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#1976d2',
            padding: '0.75rem',
            borderRadius: '25px',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'translateY(-2px)',
            },
          }}
        >
          작성 완료
        </Button>
      </Box>
    </Box>
  );
};

export default ThreadCreate;
