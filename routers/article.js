import { randomUUID } from "crypto";
import express from "express";
import db from "../db.js";


const router = express.Router();

router
  .route("")
  .post((req, res) => {
    const article = {
      ...req.body,
      id: randomUUID(),
    };
    db.data.articles.push(article);
    db.write();
    res.status(201).json(article);
  });

router.get("/articles", (req, res) => {
  res.status(200).json(db.data.articles);
});

router.get("/articles/:articleId", (req, res) => {
  const article = db.data.articles.find(({ id }) => id == req.params.articleId);
  if (!article) {
    res.status(404).send();
  }
  res.status(200).json(article);
});

router.put("/articles/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid
  );
  if (articleIndex < 0) {
    res.status(404).send();
  }

  const article = { ...req.body, id: articleId };
  db.data.articles[articleIndex] = article;
  db.write();
  res.status(200).json(article);
});

router.patch("/articles/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid
  );
  if (articleIndex < 0) {
    res.status(404).send();
  }
  const article = db.data.articles[articleIndex];
  for (const key of Object.keys(req.body)) {
    article[key] = req.body[key];
  }
  db.data.articles[articleIndex] = article;
  db.write();
  res.status(200).json(article);
});

router.delete("/articles/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid,
  );
  if (articleIndex < 0) {
    res.status(404).send();
  }
  db.data.articles.splice(articleIndex, 1);
  db.write();
  res.status(204).send(); //전달해줄 데이터가 없어서 204 전송
});

export default router;
