import ProfileMenu from './ProfileMenu';

export default function TopNav({ 
  firstName, 
  toggleSidebar 
}: { 
  firstName: string,
  toggleSidebar: () => void 
}) {
  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-primary transition-colors focus:outline-none"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <h1 className="text-xl font-semibold text-headingGray hidden md:block">Dashboard</h1>
      </div>
      <ProfileMenu firstName={firstName} />
    </header>
  );
}
