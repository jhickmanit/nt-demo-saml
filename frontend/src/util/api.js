const callApi = async (method, url, path, data) => {
  const res = await fetch(url+path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data) || undefined,
  });
  return res.json();
}

export default callApi;