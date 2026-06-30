import ProfileMenu from './ProfileMenu';

export default function TopNav({ firstName }: { firstName: string }) {
  return (
    <header className="top-nav desktop-only">
      <ProfileMenu firstName={firstName} />
    </header>
  );
}
