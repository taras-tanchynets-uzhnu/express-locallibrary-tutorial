const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  
  return fullname;
});


// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});


// Virtual for formatted lifespan
AuthorSchema.virtual("lifespan").get(function () {
  const birth = this.date_of_birth ? 
  DateTime.fromJSDate(this.date_of_birth).setLocale("uk").toLocaleString(DateTime.DATE_FULL): "n/a";

  const death = this.date_of_death ? 
  DateTime.fromJSDate(this.date_of_death).setLocale("uk").toLocaleString(DateTime.DATE_FULL): "n/a";

  let age = "";
  if (this.date_of_birth) {
    const endDate = this.date_of_death ? this.date_of_death : new Date();
    age = ` (${DateTime.fromJSDate(endDate).diff(DateTime.fromJSDate(this.date_of_birth), "years").years.toFixed(0)} років)`;
  }

  return `${birth} – ${death}${age}`;
});


// Export model
module.exports = mongoose.model("Author", AuthorSchema);

