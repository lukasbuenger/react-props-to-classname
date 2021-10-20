import React, { useEffect, useRef } from "react"
import { render } from "react-dom"
import { propsToClassName } from "../../src/create-classnamified"

interface TextColorProps {
	variant: "blue" | "red"
}

const TextColor = propsToClassName(
	"span",
	({ variant }: TextColorProps) => variant,
	["variant"],
)

const App = () => {
	const headerRef = useRef(null)
	const blueListItemRef = useRef(null)
	useEffect(() => {
		console.log(headerRef.current)
		console.log(blueListItemRef.current)
	})
	return (
		<>
			<TextColor variant="bar" as="h1" ref={headerRef}>
				Foobar
			</TextColor>
			<p>
				Text colors come in{" "}
				<TextColor variant="red">red</TextColor> and{" "}
				<TextColor variant="blue">blue</TextColor>.
			</p>
			<ul>
				<TextColor
					variant="red"
					ref={blueListItemRef}
					decorate
				>
					<li>Foo</li>
					<li>Bar</li>
				</TextColor>
				<TextColor variant="blue" decorate>
					<li>Baz</li>
					<li>Barista</li>
				</TextColor>
			</ul>
		</>
	)
}

render(<App />, document.getElementById("root"))
