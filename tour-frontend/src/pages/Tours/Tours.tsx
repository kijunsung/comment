import { Box, Container, Typography } from "@mui/material";
import IntegratedTravelPlanner from "../../components/IntegratedTravelPlanner";
import WeatherForecast from "../Weathers/WeatherForecast";
import Detail from "./detail";
import Plan from "../Schedules/plan";

export default function Tour() {
  return (
    <Box sx={{
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      width: "100%",
      paddingBottom: 4, // 하단 여백 추가
    }}> 
      {/* 헤더 섹션 */}
      <Container sx={{
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundImage: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        borderRadius: "10px",
        marginTop: 4,
        marginBottom: 4,
        padding: 3,
        color: "#fff",
        minHeight: "120px", // 고정 최소 높이
      }}>
        <Typography variant="h3" fontWeight="normal" sx={{ mb: 1 }}>
          ✈️ 나만의 여행 계획
        </Typography>
        <Typography variant="h6" fontWeight="light">
          완벽한 여행을 위한 스마트한 계획을 세워보세요
        </Typography> 
      </Container>
      
      {/* 메인 컨텐츠 영역 */}
      <Box sx={{
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {/* 통합 여행 계획 섹션 */}
        <Box sx={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          <IntegratedTravelPlanner />
        </Box>
        
        {/* 일정 관리 섹션 */}
        <Box sx={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: 3,
          minHeight: "400px", // 최소 높이 설정
          flex: 1,
        }}>
          <Plan />
        </Box>
        
        {/* 상세 정보 및 날씨 섹션 */}
        <Box sx={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}>
          {/* 상세 정보 섹션 */}
          <Box sx={{
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: 3,
          }}>
            <Detail />
          </Box>
          
          {/* 날씨 정보 섹션 */}
          <Box>
            <WeatherForecast />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}