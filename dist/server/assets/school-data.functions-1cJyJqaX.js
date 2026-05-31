import { T as TSS_SERVER_FUNCTION, g as getServerFnById, a as createServerFn } from "./server-BfycGJ7Q.js";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getSchoolData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("158f5449ae9e7c5e847c813eb4a9b806ce95f6ea705dee111fc7e2ac48764e99"));
const getWideData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("4ae15c36c6a039db70e50795525b409591a1f2e0a6effea3c776dedd074bdf4d"));
export {
  getWideData as a,
  getSchoolData as g
};
