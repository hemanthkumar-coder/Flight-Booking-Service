function compareDateTime(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getTime() > d2.getTime();
}

module.exports = {
  compareDateTime,
};
