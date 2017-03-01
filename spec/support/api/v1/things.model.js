'use strict';

const mongoose = require('mongoose');

const ThingsSchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true, unique: true},
  normalized: {
    name: String
  }
});

exports.Model = mongoose.model('Things', ThingsSchema);
