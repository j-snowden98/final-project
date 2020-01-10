const data = require('./../model_mysql.js');

async function init() {
  console.log(await data.isAuthorised(8, 1));
  console.log(await data.isAuthorised(8, 2));
  console.log(await data.isAuthorised(8, 3));
  console.log(await data.isAuthorised(8, 4));

  console.log(await data.isAuthorised(9, 1));
  console.log(await data.isAuthorised(9, 2));
  console.log(await data.isAuthorised(9, 3));
  console.log(await data.isAuthorised(9, 4));

  console.log(await data.isAuthorised(1, 1));
  console.log(await data.isAuthorised(1, 2));
  console.log(await data.isAuthorised(1, 3));
  console.log(await data.isAuthorised(1, 4));
}
init();
