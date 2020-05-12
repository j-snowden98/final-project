const should = require('chai').should();
const reportModel = require('../server/persistence/persist_report')

describe('Stage 3 persistence tests', () => {
  describe('Generating reports', () => {
    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by date ascending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      first = stringToDate(report[0].contactDate, report[0].contactTime);
      last = stringToDate(report[26].contactDate, report[26].contactTime);
      first.should.be.lessThan(last);
    });

    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by date descending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 1;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      first = stringToDate(report[0].contactDate, report[0].contactTime);
      last = stringToDate(report[26].contactDate, report[26].contactTime);
      first.should.be.greaterThan(last);
    });

    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by resident name ascending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 2;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      let orderCorrect = report[0].resName <= report[26].resName;
      orderCorrect.should.deep.equal(true);
    });

    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by resident name descending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 3;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      let orderCorrect = report[0].resName >= report[26].resName;
      orderCorrect.should.deep.equal(true);
    });

    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by username ascending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 4;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      let orderCorrect = report[0].username <= report[26].username;
      orderCorrect.should.deep.equal(true);
    });

    it('Get all historical contact sheets between 1st Jan 2000 and 1st May 2020 ordered by username descending', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 5;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(27);
      let orderCorrect = report[0].username >= report[26].username;
      orderCorrect.should.deep.equal(true);
    });

    it('Get all contact sheets for resident Morris Moss between the dates and times', async() => {
      let userFilter = '';
      let resFilter = 'Morris Moss';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(12);
      for (let s of report) {
        s.resName.should.deep.equal('Morris Moss');
      }

    });
  });
});


function stringToDate(dateString, time) {
  let dateParts = dateString.split("/");
  let dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
  let timeParts = time.split(':');
  dateObject.setHours(timeParts[0]);
  dateObject.setMinutes(timeParts[1]);
  return dateObject;
}