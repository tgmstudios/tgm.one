# TGM.One

A modern portfolio website featuring an interactive 3D globe visualization of projects, built with Nuxt 3 and Three.js.

![TGM.One](https://img.shields.io/badge/Nuxt-3.13.0-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.2.13-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.15-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## 🌟 Features

- **Interactive 3D Globe**: Visualize projects on a rotating 3D Earth using Three.js and globe.gl
- **Dynamic Project Display**: Projects are fetched from the Foligo API and displayed with custom icons and labels
- **Smart Label Collision Detection**: Advanced screen-space collision detection prevents label overlap
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Blog System**: Markdown-based blog with Mermaid diagram support
- **Project Pages**: Detailed project pages with rich content
- **Search Functionality**: Search across projects and blog posts
- **Performance Optimized**: ISR (Incremental Static Regeneration) for fast page loads
- **Docker Deployment**: Containerized with multi-architecture support (AMD64/ARM64)

## 🚀 Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) - The Intuitive Vue Framework
- **3D Graphics**: [Three.js](https://threejs.org/) & [globe.gl](https://github.com/vasturiano/globe.gl)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Content**: Markdown with [markdown-it](https://github.com/markdown-it/markdown-it)
- **Diagrams**: [Mermaid](https://mermaid.js.org/)
- **Icons**: [Heroicons](https://heroicons.com/)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tgm-one.git
cd tgm-one
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
FOLIGO_SUBDOMAIN=your-subdomain
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📜 Available Scripts

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run generate` - Generate static site

## 🏗️ Project Structure

```
tgm-one/
├── components/          # Vue components
│   ├── GlobeWidget.vue # 3D globe visualization
│   └── ...
├── pages/              # Nuxt pages (file-based routing)
│   ├── index.vue      # Home page with globe
│   ├── about.vue      # About page
│   ├── projects.vue   # Projects listing
│   └── blog/          # Blog pages
├── layouts/           # Layout components
├── composables/       # Vue composables
├── lib/               # Utility libraries
├── assets/            # Static assets
├── public/            # Public files
└── server/            # Server-side code
```

## 🌍 Globe Widget

The `GlobeWidget` component creates an interactive 3D globe that:

- Fetches projects from the Foligo API
- Displays projects as icons on the globe surface
- Shows project titles with smart collision detection
- Handles click events to navigate to project pages
- Auto-rotates for visual appeal
- Adapts to screen size (mobile/desktop)

### Key Features:

- **Coordinate Generation**: Projects are assigned random coordinates with minimum distance constraints
- **Label Collision Detection**: Screen-space grid-based collision detection prevents overlapping labels
- **Responsive Scaling**: Icons and labels scale based on screen width
- **Performance**: Uses requestAnimationFrame for smooth animations

## 🐳 Docker Deployment

The project includes Docker support with multi-architecture builds:

```bash
# Build Docker image
docker build -f .docker/Dockerfile -t tgm-one:latest .

# Run container
docker run -p 8080:8080 tgm-one:latest
```

## 🚢 CI/CD

GitHub Actions workflow automatically:
- Builds Docker images for AMD64 and ARM64
- Pushes to registry.tgm.one
- Deploys to Rancher Kubernetes cluster
- Supports both `master` (production) and `staging` branches

## 🔧 Configuration

Key configuration in `nuxt.config.ts`:

- **Runtime Config**: Foligo API settings
- **Route Rules**: ISR and prerendering configuration
- **Meta Tags**: SEO and social media optimization
- **Tailwind CSS**: Integrated via Nuxt module

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👤 Author

**Aiden Johnson**

- Website: [tgm.one](https://tgm.one)
- Studying Computer Science at Penn State
- Building products at Telaeris
- Leading technical initiatives for PSU Competitive Cybersecurity Organization

## 🙏 Acknowledgments

- [globe.gl](https://github.com/vasturiano/globe.gl) for the amazing 3D globe library
- [Three.js](https://threejs.org/) for 3D graphics capabilities
- [Nuxt](https://nuxt.com/) team for the excellent framework

---

Built with ❤️ using Nuxt 3 and Three.js
