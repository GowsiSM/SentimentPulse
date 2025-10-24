# Contributing to SentimentPulse

Thank you for your interest in contributing to SentimentPulse! We welcome contributions from the community and are grateful for your support.

## 🚀 How to Contribute

### 1. Fork the Repository
Click the "Fork" button at the top right of the repository page to create your own copy.

### 2. Clone Your Fork
```bash
git clone https://github.com/GowsiSM/SentimentPulse
cd SentimentPulse
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/AmazingFeature
```

Use descriptive branch names:
- `feature/add-export-functionality`
- `bugfix/fix-scraping-timeout`
- `docs/update-installation-guide`

### 4. Make Your Changes
- Write clean, readable code
- Follow existing code style and conventions
- Comment your code where necessary
- Test your changes thoroughly

### 5. Commit Your Changes
```bash
git add .
git commit -m "Add some AmazingFeature"
```

**Commit Message Guidelines:**
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
- `feat: add CSV export functionality`
- `fix: resolve scraping timeout issue`
- `docs: update README with installation steps`
- `style: format code according to PEP 8`

### 6. Push to Your Branch
```bash
git push origin feature/AmazingFeature
```

### 7. Open a Pull Request
- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your fork and branch
- Provide a clear description of your changes
- Link any relevant issues

## 📋 Contribution Guidelines

### Code Style

**Python (Backend):**
- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions small and focused

**JavaScript/React (Frontend):**
- Use ES6+ syntax
- Follow React best practices and hooks guidelines
- Use functional components over class components
- Keep components small and reusable

### Testing
- Add tests for new features when possible
- Ensure all existing tests pass
- Test your changes in both development and production builds

### Documentation
- Update README.md if you add or change features
- Add comments to complex code sections
- Update API documentation for new endpoints
- Include screenshots for UI changes

### Pull Request Process
1. Ensure your code builds without errors
2. Update documentation as needed
3. Add a clear PR description explaining:
   - What changes you made
   - Why you made them
   - How to test them
4. Link related issues (e.g., "Closes #123")
5. Wait for review and address feedback promptly

## 🐛 Reporting Issues

### Bug Reports
When reporting bugs, please include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**:
  - OS: (e.g., Windows 10, macOS 13, Ubuntu 22.04)
  - Python version
  - Node.js version
  - Browser (if frontend issue)

### Feature Requests
When requesting features, please include:
- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you envision it working
- **Alternatives**: Any alternative solutions you've considered

### Questions
For questions:
- Check existing documentation first
- Search closed issues for similar questions
- Provide context and details in your question

## 🎯 Areas to Contribute

We especially welcome contributions in these areas:

### High Priority
- Bug fixes and error handling improvements
- Performance optimizations
- Documentation improvements
- Test coverage expansion

### Feature Ideas
- Multi-platform support (Amazon, Flipkart)
- Advanced filtering and search capabilities
- Email notifications for completed analyses
- Comparative analysis between products
- Mobile responsive improvements
- API rate limiting and caching

### Good First Issues
Look for issues labeled `good first issue` - these are great for newcomers!

## 🔍 Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Code Review Process

1. **Initial Review**: Maintainers review PRs within 3-5 business days
2. **Feedback**: Address any requested changes
3. **Approval**: Once approved, a maintainer will merge your PR
4. **Recognition**: Contributors are credited in release notes

## 🤝 Community

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## 💡 Tips for Success

- Start small - fix typos, improve docs, tackle good first issues
- Ask questions if you're unsure about anything
- Be patient - reviews take time
- Communicate clearly and professionally
- Keep PRs focused on a single feature or fix

## 🎉 Recognition

Contributors are recognized in:
- GitHub Contributors page

Thank you for contributing to SentimentPulse! Your efforts help make this project better for everyone. 🚀

---

**Need help getting started?** Check out [GitHub's guide to contributing to open source](https://opensource.guide/how-to-contribute/).