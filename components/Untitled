interface Project {
  title: string;
  category: string;
  image: string;
  link?: string;
}

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  // Si no hay proyectos, evitamos que rompa
  if (!projects || projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project, index) => (
        <div 
          key={index}
          className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Imagen del proyecto con zoom suave en hover */}
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-[var(--chip)]">
            <img 
              src={project.image} 
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-[var(--muted)]">{project.category}</p>
            </div>
            
            {/* Flecha indicadora que aparece sutilmente */}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}