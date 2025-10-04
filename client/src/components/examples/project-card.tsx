import { ProjectCard } from "../project-card";

export default function ProjectCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
      <ProjectCard
        id="1"
        title="E-commerce Platform"
        description="Complete database schema for a multi-vendor e-commerce platform with products, orders, and user management"
        databaseType="PostgreSQL"
        createdAt="2 days ago"
        tableCount={12}
        onEdit={() => console.log("Edit clicked")}
        onExport={() => console.log("Export clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <ProjectCard
        id="2"
        title="Social Media App"
        description="Schema for a social networking platform with posts, comments, likes, and user relationships"
        databaseType="MongoDB"
        createdAt="1 week ago"
        tableCount={8}
        onEdit={() => console.log("Edit clicked")}
        onExport={() => console.log("Export clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <ProjectCard
        id="3"
        title="Food Delivery Service"
        description="Database design for a food delivery application with restaurants, menus, orders, and delivery tracking"
        databaseType="MySQL"
        createdAt="3 days ago"
        tableCount={15}
        onEdit={() => console.log("Edit clicked")}
        onExport={() => console.log("Export clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  );
}
