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
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.resName.should.deep.equal('Morris Moss');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets for resident Edwin Eddison between the dates and times', async() => {
      let userFilter = '';
      let resFilter = 'Edwin Eddison';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(9);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.resName.should.deep.equal('Edwin Eddison');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets written by user test1 between the dates and times', async() => {
      let userFilter = 'test1';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(5);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.username.should.deep.equal('test1');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets written by user test3 between the dates and times', async() => {
      let userFilter = 'test3';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(6);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.username.should.deep.equal('test3');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets written by user test1 for resident Morris Moss between the dates and times', async() => {
      let userFilter = 'test1';
      let resFilter = 'Morris Moss';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = '';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(4);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.username.should.deep.equal('test1');
        s.resName.should.deep.equal('Morris Moss');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets where the resident is calm between the dates and times', async() => {
      let userFilter = '';
      let resFilter = '';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = 'calm';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(6);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.mood.should.deep.equal('Calm');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets where the resident Morris Moss is relaxed between the dates and times', async() => {
      let userFilter = '';
      let resFilter = 'Morris Moss';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = 'relaxed';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(12);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.resName.should.deep.equal('Morris Moss');
        s.mood.should.deep.equal('Relaxed');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
      }
    });

    it('Get all contact sheets recorded by user test2 where the resident Morris Moss is relaxed between the dates and times', async() => {
      let userFilter = 'test2';
      let resFilter = 'Morris Moss';
      let afterdate = '2000-01-01';
      let afterTime = '00:00';
      let beforeDate = '2020-05-01';
      let beforeTime = '23:59';
      let drinkGiven = 'false';
      let moodFilter = 'relaxed';
      let orderBy = 0;

      let report = await reportModel.getContact(userFilter, resFilter, afterdate, afterTime, beforeDate, beforeTime, drinkGiven, moodFilter, orderBy);
      report.should.have.lengthOf(4);
      let start = new Date(afterdate + ' ' + afterTime);
      let end = new Date(beforeDate + ' ' + beforeTime);
      let csDate;
      for (let s of report) {
        s.username.should.deep.equal('test2');
        s.resName.should.deep.equal('Morris Moss');
        s.mood.should.deep.equal('Relaxed');
        csDate = stringToDate(s.contactDate, s.contactTime);
        csDate.should.be.greaterThan(start);
        csDate.should.be.lessThan(end);
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