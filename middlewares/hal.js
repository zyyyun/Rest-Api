export function halMiddleware(req, res, next) {
  const json = res.json;

  // Content-Type 설정
  res.set("Content-Type", "application/vnd.hal+json");

  // res.json 함수 재정의
  res.json = function(data) {
    // data가 정의되어 있을 때만 _links.self 설정
    if (data) {
      data._links = {
        self: {
          href: req.originalUrl,
        },
      };
    }
    json.call(this, data);
  };

  next();
}
