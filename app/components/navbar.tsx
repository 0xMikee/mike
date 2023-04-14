import { Link, useLocation } from "@remix-run/react";
import {
	DarkModeToggle,
	links as themeStyles,
} from "~/components/themeSwitcher";
import styles from "~/styles/css/5_components/navbar.css";
import {
	HamburgerMenu,
	links as hamburgerStyles,
} from "~/components/hamburgerMenu";
import type { ReactNode } from "react";
import { getUserImgSrc, useOptionalAdminUser, useOptionalUser } from "~/utils/misc";
import { LogoutConfirm } from "./logoutConfirm";
import { UserMenu } from "~/components/userMenu";
import { ButtonLink } from "~/utils/forms";

export function links() {
	return [
		...hamburgerStyles(),
		...themeStyles(),
		{ rel: "stylesheet", href: styles },
	];
}

export function NavLink({
	to,
	extendedClass,
	children,
	...rest
}: Omit<Parameters<typeof Link>["0"], "to"> & {
	to: string;
	extendedClass?: string;
	children: ReactNode;
}) {
	const location = useLocation();
	const isSelected =
		to === location.pathname || location.pathname.startsWith(`${to}/`);

	return (
		<Link
			prefetch="intent"
			className={
				extendedClass
					? extendedClass
					: `navbar__link ${isSelected ? "navbar__link--active" : ""}`
			}
			to={to}
			{...rest}
		>
			{children}
		</Link>
	);
}

const Navbar = () => {
	const user = useOptionalUser();
	const isAdmin = useOptionalAdminUser();

	return (
		<nav className="navbar">
			<Link prefetch="intent" to="/" className="navbar__logoLink">
				{!user ? <h2>MikeApp</h2> : <h2>{user.name}</h2>}
			</Link>
			<ul className="navbar__links">
				{isAdmin && <NavLink to={"/admin"}>Admin</NavLink>}
				{user && (
					<>
						<NavLink to={"/settings/profile"}>Profile</NavLink>
						<LogoutConfirm />
					</>
				)}
			</ul>
			<div className="navbar__settings">
				{user ? (
					<img
						src={getUserImgSrc(user?.imageId)}
						alt={user?.username}
						className="navbar__userPhoto"
					/>
				) : null}
				<div className="navbar__settings">
					{user ? <UserMenu /> : null}
					<HamburgerMenu />
					<DarkModeToggle />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
