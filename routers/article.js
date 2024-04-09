import { randomUUID } from "crypto";
import express from "express";
import db from "../db.js";
// hypertext Application Language
const router = express.Router();

router.post("",(req, res) => {
  const article = {
    ...req.body,
    id: randomUUID(),
  };
  db.data.articles.push(article);
  db.write();
  res.set("Content-Type", "application/vnd.hal+json");
  res.status(201).json({
    "_links": {
      "self":{
        "href":req.originalUrl
      },
    },
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
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        }
      },
      message: "조회하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

router.put("/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid
  );

  if (articleIndex < 0) {
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        }
      },
      message: "조회하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }

  const article = { ...req.body, id: articleId };
  db.data.articles[articleIndex] = article;
  db.write();

  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

router.patch("/:articleid", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(
    ({ id }) => id == req.params.articleid
  );

  res.set("Content-Type", "application/vnd.hal+json");
  if (articleIndex < 0) {
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        }
      },
      message: "수정하려는 게시글이 존재하지 않습니다.",
      error: "Not Found",
    });
  }

  const article = db.data.articles[articleIndex];
  for (const key of Object.keys(req.body)) {
    article[key] = req.body[key];
  }
  db.data.articles[articleIndex] = article;
  db.write();
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
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

  res.status(200).send({
    _links: {
      self: {
        href: req.originalUrl,
      },
      articles: {
        href: req.baseUrl,
      }
    },
    message: "게시글을 성공적으로 삭제했습니다.",
  });
});

export default router;
