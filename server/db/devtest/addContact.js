const data = require('./../model_mysql.js')

async function init() {
  const result = await data.insertContact(1, 2, false, true, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
  console.log(result);
}

try {
  init();
}

catch (e) {
  console.log(e);
}
