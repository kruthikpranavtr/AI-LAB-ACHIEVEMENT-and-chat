const mongoose = require('mongoose');
const Project = require('../models/Project');

/**
 * Helper to find project by either MongoDB _id or custom numeric id
 */
const findProjectByIdentifier = async (idParam) => {
  if (mongoose.isValidObjectId(idParam)) {
    const project = await Project.findById(idParam);
    if (project) return project;
  }

  // Try numeric id
  const numId = parseInt(idParam, 10);
  if (!isNaN(numId)) {
    return await Project.findOne({ id: numId });
  }

  return null;
};

/**
 * @desc    Get all projects with filtering, search, sorting & pagination
 * @route   GET /api/v1/projects
 * @access  Public
 */
const getProjects = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      year,
      featured,
      technology,
      sort,
      page = 1,
      limit = 50, // generous default so standard queries retrieve all items
    } = req.query;

    const query = {};

    // 1. Category Filter (skip if "All")
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // 2. Status Filter (skip if "All")
    if (status && status !== 'All') {
      query.status = { $regex: new RegExp(`^${status.trim()}$`, 'i') };
    }

    // 3. Year Filter (skip if "All")
    if (year && year !== 'All') {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        query.year = yearNum;
      }
    }

    // 4. Featured Filter
    if (featured !== undefined) {
      query.featured = featured === 'true' || featured === true;
    }

    // 5. Technology Filter (skip if "All")
    if (technology && technology !== 'All') {
      query.technologies = { $elemMatch: { $regex: new RegExp(`^${technology.trim()}$`, 'i') } };
    }

    // 6. Search across title, descriptions, category, technologies, team
    if (search && search.trim()) {
      const s = search.trim();
      const searchRegex = new RegExp(s, 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { technologies: { $in: [searchRegex] } },
        { 'team.name': searchRegex },
        { 'team.role': searchRegex },
      ];
    }

    // 7. Sort Options
    let sortOption = { featured: -1, year: -1, id: 1 };
    if (sort) {
      switch (sort.toLowerCase()) {
        case 'newest':
          sortOption = { year: -1, createdAt: -1, id: -1 };
          break;
        case 'oldest':
          sortOption = { year: 1, createdAt: 1, id: 1 };
          break;
        case 'title':
        case 'alpha-asc':
          sortOption = { title: 1 };
          break;
        case 'alpha-desc':
          sortOption = { title: -1 };
          break;
        case 'featured':
          sortOption = { featured: -1, year: -1, id: 1 };
          break;
        default:
          sortOption = { featured: -1, year: -1, id: 1 };
      }
    }

    // 8. Pagination Setup
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = limit === 'all' || parseInt(limit, 10) === 0 ? 0 : Math.max(1, parseInt(limit, 10) || 50);

    const total = await Project.countDocuments(query);
    const pages = limitNum === 0 ? 1 : Math.ceil(total / limitNum) || 1;

    let queryExec = Project.find(query).sort(sortOption);
    if (limitNum > 0) {
      queryExec = queryExec.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const projects = await queryExec;

    return res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum === 0 ? total : limitNum,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('[Project Controller - getProjects Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects. Please try again later.',
    });
  }
};

/**
 * @desc    Get a single project by id or _id
 * @route   GET /api/v1/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdentifier(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with identifier: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error('[Project Controller - getProjectById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project details.',
    });
  }
};

/**
 * @desc    Create a new project (Admin Only)
 * @route   POST /api/v1/projects
 * @access  Private/Admin
 */
const createProject = async (req, res) => {
  try {
    const {
      title,
      category,
      status,
      year,
      featured,
      shortDescription,
      description,
      problem,
      objective,
      solution,
      features,
      technologies,
      team,
      image,
      github,
      demo,
      timelineStage,
      outcome,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Project category is required.' });
    }
    if (!status || !status.trim()) {
      return res.status(400).json({ success: false, message: 'Project status is required.' });
    }
    if (year === undefined || year === null || isNaN(parseInt(year, 10))) {
      return res.status(400).json({ success: false, message: 'Valid project year is required.' });
    }
    if (!shortDescription || !shortDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Short description is required.' });
    }

    // Auto-calculate next numeric ID if not supplied
    let nextId = req.body.id;
    if (!nextId) {
      const highest = await Project.find().sort({ id: -1 }).limit(1);
      nextId = highest && highest.length > 0 && typeof highest[0].id === 'number' ? highest[0].id + 1 : 1;
    }

    const newProject = await Project.create({
      id: nextId,
      title: title.trim(),
      category: category.trim(),
      status: status.trim(),
      year: parseInt(year, 10),
      featured: Boolean(featured),
      shortDescription: shortDescription.trim(),
      description: description ? description.trim() : '',
      problem: problem ? problem.trim() : '',
      objective: objective ? objective.trim() : '',
      solution: solution ? solution.trim() : '',
      features: Array.isArray(features) ? features : [],
      technologies: Array.isArray(technologies) ? technologies : [],
      team: Array.isArray(team) ? team : [],
      image: image ? image.trim() : '',
      github: github ? github.trim() : '',
      demo: demo ? demo.trim() : '',
      timelineStage: timelineStage ? timelineStage.trim() : 'Development',
      outcome: outcome ? outcome.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: newProject,
      },
    });
  } catch (error) {
    console.error('[Project Controller - createProject Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create project.',
    });
  }
};

/**
 * @desc    Update an existing project (Admin Only)
 * @route   PUT /api/v1/projects/:id
 * @access  Private/Admin
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdentifier(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with identifier: ${id}`,
      });
    }

    // Whitelist updatable fields to prevent arbitrary injections
    const allowedFields = [
      'title',
      'category',
      'status',
      'year',
      'featured',
      'shortDescription',
      'description',
      'problem',
      'objective',
      'solution',
      'features',
      'technologies',
      'team',
      'image',
      'github',
      'demo',
      'timelineStage',
      'outcome',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'year') {
          project[field] = parseInt(req.body[field], 10);
        } else if (field === 'featured') {
          project[field] = Boolean(req.body[field]);
        } else {
          project[field] = req.body[field];
        }
      }
    });

    const updated = await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updated,
      },
    });
  } catch (error) {
    console.error('[Project Controller - updateProject Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update project.',
    });
  }
};

/**
 * @desc    Delete a project (Admin Only)
 * @route   DELETE /api/v1/projects/:id
 * @access  Private/Admin
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await findProjectByIdentifier(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with identifier: ${id}`,
      });
    }

    await Project.deleteOne({ _id: project._id });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('[Project Controller - deleteProject Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project.',
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
