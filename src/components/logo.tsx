import type { ReactNode } from "react";

import logo from "~/public/icon.svg?url";

interface LogoProps {
	className?: string;
}

export function Logo(props: LogoProps): ReactNode {
	return (
		<img aria-hidden={true} alt="" className={props.className} height={16} src={logo} width={16} />
	);
}
