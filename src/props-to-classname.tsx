import {
	Children,
	cloneElement,
	createElement,
	ForwardedRef,
	forwardRef,
	HTMLProps,
	isValidElement,
	ReactHTML,
} from "react"
import clsx from "clsx"

function removeKeys<T, K extends keyof T>(
	target: T,
	filter: K[],
): Omit<T, K> {
	const res = {} as Omit<T, K>
	// Object.keys always gives a string[], so we have to cast here.
	for (const key of Object.keys(target) as K[]) {
		if (!filter.includes(key)) {
			// @ts-expect-error We expect an error here, because there's no way (I know of) of
			// telling the compiler that key is, by exclusion both a keyof T but alos valid key
			// on the resulting set.
			res[key] = target[key]
		}
	}
	return res
}

interface ClassNamifiedElementProps<
	TElement extends keyof ReactHTML,
> extends HTMLProps<ReactHTML[TElement]> {
	/** Customise the DOM element with which this component is supposed to get rendered. */
	as?: TElement
	/**
	 * If set to "true", this component will not render per se, but instead will
	 * decorate all of its children with its `className` composition. Will throw a
	 * warning if combined with the `as` property. Defaults to `false`.
	 */
	decorate?: boolean
}

export function createElementWithClassNameProps<
	// Placeholder for the inferred custom props.
	TProps,
	// Type of a given default element.
	TDefaultElement extends keyof ReactHTML = "div",
>(
	/** A string representing the DOM element as which the component should get rendered per default. Required. */
	defaultElement: TDefaultElement,
	/**
	 * A function that should reduce any given properties (native or custom) to a CSS class name. Type this function
	 * to accept all things you'd expect and need in order to render a comprehensive representation. Required.
	 */
	getClassName: (v: TProps) => string,
	/**
	 * An array of (probably mostly custom) properties, that you don't want to get passed to the actual rendered DOM node.
	 * An example: Your classified component takes a `variant` property to evaluate, well, variants. Obviously, this is by
	 * no means a value you want to have rendered as a prop on the resulting DOM node. To screen this value from getting
	 * passed as an actual render prop, you would give an array of `['variant']` at this position. Defaults to `[]`.
	 */
	omit: (keyof TProps)[] = [],
) {
	return forwardRef(
		// We infer the element of the given call.
		<TElement extends keyof ReactHTML = TDefaultElement>(
			// Here, we combine the native DOM elements props with your custom ones
			props: TProps & ClassNamifiedElementProps<TElement>,
			// Refs are important, so lets give one and cast it to the type given within `props`.
			ref: ForwardedRef<ReactHTML[TElement]>,
		) => {
			// Passing a ref to a component whose main job it is to clone its children and apply a new set of properties to them gives way to a
			// series of pretty unpredictable side effects. This is actually the only hard no we're introducing here. Hence we throw.
			if (props.decorate && ref) {
				throw new Error(
					'ClassNamifiedElement error: You passed a "ref" to a component which has a "decorate" flag as well. This is not allowed. Either pass your "ref"  directly to the child component you want to reference or consider not decorating at all.',
				)
			}
			// `decorate` takes precendence over `as`. This is not super obvious to people not familiar with the pattern, hence a warning is due.
			if (props.decorate && props.as) {
				console.warn(
					'ClassNamifiedElement warning: You passed a "decorate" flag to a component which has an "as" property as well. Know that "decorate" flags supercede any given "as" values.',
				)
			}
			// `decorate` without children doesn't make much sense. Not super obvious to folks not familiar with the pattern, hence a warning is due.
			if (props.decorate && !props.children) {
				console.warn(
					'ClassNamifiedElement warning: You passed the "decorate" flag to a component without children. This will result in an empty component being rendered.',
				)
			}
			// If `decorate` equals true and the component actually has children ...
			if (props.decorate && props.children) {
				return (
					<>
						{Children.map(props.children, (el) => {
							// ...for each child, that is a valid DOM node ...
							return isValidElement(el)
								? // ...1.) clone it ...
								  cloneElement(el, {
										// and 2.) give it the decorators className value.
										className: clsx(
											el.props.className,
											props.className,
											getClassName(props as TProps),
										),
								  })
								: // else, and of course, bail out.
								  null
						})}
					</>
				)
			}
			// If this should result in an actual DOMNode, clean the props according to the clients instructions...
			const cleanProps = removeKeys(props, [
				"as",
				"className",
				"decorate",
				...omit,
			])
			// ...create the respective element,
			return createElement(props.as || defaultElement, {
				...cleanProps,
				ref,
				// ...and give it the respective className composition,
				className: clsx(
					props.className,
					getClassName(props as TProps),
				),
			})
		},
	)
}

export const propsToClassName =
	createElementWithClassNameProps
