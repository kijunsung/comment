import api from './api';
import { Comment, CommentRequest } from '../types/comment';  

// 댓글 목록 조회 parentId가 있으면 대댓글로 처리됨 7/2
export async function getComments(threadId: number): Promise<Comment[]> {
  const response = await api.get(`/comments/thread/${threadId}`);  
  return response.data;
}

// 댓글 또는 대댓글 작성 (parentId가 있으면 대댓글로 처리됨)
export async function postComment( data: CommentRequest): Promise<Comment> {
  const response = await api.post(`/comments`, data);  
  return response.data;
}
// 댓글 수정
export async function updateComment(commentId: number, data: CommentRequest): Promise<void> {
  await api.put(`/comments/${commentId}`, data);
}

// 댓글 삭제
export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/comments/${commentId}`);
}