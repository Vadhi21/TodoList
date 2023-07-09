
exports.getDate=function(value){
  const today = new Date();
const options = {
  weekday: 'long',
  month: 'long',
   day: 'numeric'
 };
return today.toLocaleDateString("en-US", options);// format is day,date for this
}
//can be module.exports.getDate also
exports.getDay=function(value){
  const today = new Date();
const options = {
  weekday: 'long'
 };
return today.toLocaleDateString("en-US", options);// format is day,date for this
}
