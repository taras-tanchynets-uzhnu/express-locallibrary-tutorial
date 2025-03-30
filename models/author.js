const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual('name').get(function () {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_SHORT)
    : '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_SHORT)
    : '';
});

AuthorSchema.virtual('lifespan_formatted').get(function () {
  let lifespan = '';
  if (this.date_of_birth) {
    lifespan += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  }
  if (this.date_of_death) {
    lifespan += ` - ${DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)}`;
  }
  return lifespan;
});

AuthorSchema.virtual('age').get(function () {
  if (this.date_of_birth) {
    const birthDate = DateTime.fromJSDate(this.date_of_birth);
    const endDate = this.date_of_death
      ? DateTime.fromJSDate(this.date_of_death)
      : DateTime.local();
    return Math.floor(endDate.diff(birthDate, 'years').years); // Округлення до цілого числа
  }
  return '';
});

module.exports = mongoose.model('Author', AuthorSchema);