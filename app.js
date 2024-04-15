import express from "express";
import articleRouter from "./routers/article.js"
import { halMiddleware } from "./middlewares/hal.js";
import morgan from "morgan";

const app = express();

app.use(morgan());
app.use(express.json());
app.use(halMiddleware);

app.use("/articles",articleRouter);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// 목표: 게시글을 조작하는 ApI만들기(CRUD)
// 기능:
// 1. 게시글 생성
// 2. 게시글 조회
// 2-1. 게시글 목록 조회
// 2-2. 게시글 상세 조회
// 3. 게시글 수정
// 4. 게시글 삭제

// API Client
// CLI: cURL(보편적, 불편함), Httpie(편함)
// GUI: Postman, Insomnia 


// 불편함
// 1. 서버가 재시작될때마다 데이터가 초기화
// 2. 데이터가 고유하지 않다.