import { randomUUID } from "crypto";
import express from "express";
import db from "../db.js";
import { articleCreateSchema, articleUpdateSchema, articlePartialUpdateSchema } from "../schemas/article.js";
// hypertext Application Language
const router = express.Router();

router.post("",(req, res) => {
  const {error, value} = articleCreateSchema.validate(req.body);
  console.log(error);
  console.log(value);

  if(error){
    return res.status(400).json({
      message: error.details[0].message,
    })
  }
  
  const article = {
    ...value,
    id: randomUUID(),
  };
  db.data.articles.push(article);
  db.write();
  res.set("Content-Type", "application/vnd.hal+json");
  return res.status(201).json({
    
    _embedded:{
      article:{
        _links:{
          self:{
            href: `${req.originalUrl}/${article.id}`
          },
        },
        ...article,
      },
    },
  });
});

router.get("", (req, res) => {
  res.set("Content-Type", "application/vnd.hal+json");
  return res.status(200).json({
    _embedded: {
      articles: db.data.articles.map((article) =>({
        _links: {
          self: {
            href: `${req.originalUrl}/${article.id}`,
          },
        },
        ...article,
      })),
    }
  });
});

router.get("/:articleId", (req, res) => {
  const article = db.data.articles.find(
    ({ id }) => id == req.params.articleId,
    );
  res.set("Content-Type", "application/vnd.hal+json");
  if (!article) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        }
      },
      message: "조회하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }
  return res.status(200).json({
    _embedded: {
      article:{
        _links:{
          self:{
            href: `${req.originalUrl}`,
          },
        },
        ...article,
      },
    },
  });
});

router.put("/:articleId", (req, res) => {
  res.set("Content-Type", "application/vnd.hal+json");

  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleId
  );

  if (articleIndex < 0) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        }
      },
      message: "수정하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }

  const {error, value} = articleUpdateSchema.validate(req.body);

  if(error){
    return res.status(400).json({
      message: error.details[0].message,
    })
  }

  const article = {...value, id: articleId };
  db.data.articles[articleIndex] = article;
  db.write();

  return res.status(200).json({
    _embedded: {
      article:{
        _links:{
          self:{
            href: `${req.originalUrl}`,
          },
        },
        ...article,
      },
    },
  });
});

router.patch("/:articleId", (req, res) => {
  res.set("Content-Type", "application/vnd.hal+json");
  
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleId
    );

  if (articleIndex < 0) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        }
      },
      message: "수정하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }

  const {error, value} = articlePartialUpdateSchema.validate(req.body);

  if(error){
    return res.status(400).json({
      message: error.details[0].message,
    })
  }

  const article = db.data.articles[articleIndex];
  for (const key of Object.keys(value)) {
    article[key] = value[key];
  }
  db.data.articles[articleIndex] = article;
  db.write();
  return res.status(200).json({
    _embedded: {
      article:{
        _links:{
          self:{
            href: `${req.originalUrl}`,
          },
        },
        ...article,
      },
    },
  });
});

router.delete("/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid,
  );

  res.set("Content-Type", "application/vnd.hal+json");
  
  if (articleIndex < 0) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        }
      },
      message: "삭제하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }
  db.data.articles.splice(articleIndex, 1);
  db.write();
  // res.status(204).send(); //전달해줄 데이터가 없어서 204 전송

  return res.status(200).send({
    _links: {
      articles: {
        href: req.baseUrl,
      }
    },
    message: "게시글을 성공적으로 삭제했습니다.",
  });
});

export default router;
