export type postData = {
  mimeType: string;
  parsed?: null | any;
  text: string;
};

export type response = {
  status: number | "default";
  statusText?: string;
  content: {
    mimeType: string;
    parsed?: Record<string, any>;
    text: string;
  };
};

export type request = {
  method: "post" | "get" | "put" | "patch" | "delete";
  url: URL;
  path: string;
  queryString?: [
    {
      name: string;
      value: string;
    },
  ];
  postData?: postData;
};

export type t = {
  request: request;
  response: response;
  location: string;
};
