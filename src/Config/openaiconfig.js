import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: process.env.REACT_APP_organization,
    apiKey: process.env.REACT_APP_OPENAI,
  });
  const openai = new OpenAIApi(configuration);

  export { openai };