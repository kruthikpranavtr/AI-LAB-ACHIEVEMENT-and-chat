const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: 'Contributor',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Project status is required'],
      trim: true,
      default: 'Ongoing',
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Project year is required'],
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    problem: {
      type: String,
      trim: true,
      default: '',
    },
    objective: {
      type: String,
      trim: true,
      default: '',
    },
    solution: {
      type: String,
      trim: true,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    team: {
      type: [teamMemberSchema],
      default: [],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    demo: {
      type: String,
      trim: true,
      default: '',
    },
    timelineStage: {
      type: String,
      trim: true,
      default: 'Development',
    },
    outcome: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Normalize team members before saving if strings were provided
projectSchema.pre('save', function (next) {
  if (Array.isArray(this.team)) {
    this.team = this.team.map((member) => {
      if (typeof member === 'string') {
        return { name: member.trim(), role: 'Contributor' };
      }
      return member;
    });
  }
  next();
});

// Clean JSON serialization
projectSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.id === undefined && obj._id) {
    obj.id = obj._id.toString();
  }
  delete obj.__v;
  return obj;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
