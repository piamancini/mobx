import {ValueMode} from "../types/modifiers";
import {isObservableMap} from "../types/observablemap";
import {asObservableObject, setObservableObjectInstanceProperty} from "../types/observableobject";
import {isObservable} from "../api/isobservable";
import {invariant, isPropertyConfigurable, hasOwnProperty} from "../utils/utils";

/**
 * Extends an object with reactive capabilities.
 * @param target the object to which reactive properties should be added
 * @param properties the properties that should be added and made reactive
 * @returns targer
 */
export function extendObservable<A extends Object, B extends Object>(target: A, ...properties: B[]): A & B {
	invariant(arguments.length >= 2, "extendObservable expected 2 or more arguments");
	invariant(typeof target === "object", "extendObservable expects an object as first argument");
	invariant(!(isObservableMap(target)), "extendObservable should not be used on maps, use map.merge instead");
	properties.forEach(propSet => {
		invariant(typeof propSet === "object", "all arguments of extendObservable should be objects");
		invariant(!isObservable(propSet), "extending an object with another observable (object) is not supported. Please construct an explicit propertymap, using `toJS` if need. See issue #540");
		extendObservableHelper(target, propSet, ValueMode.Recursive, null);
	});
	return <A & B> target;
}

export function extendObservableHelper(target, properties, mode: ValueMode, name: string): Object {
	const adm = asObservableObject(target, name, mode);
	for (let key in properties) if (hasOwnProperty(properties, key)) {
		if (target === properties && !isPropertyConfigurable(target, key))
			continue; // see #111, skip non-configurable or non-writable props for `observable(object)`.
		const descriptor = Object.getOwnPropertyDescriptor(properties, key);
		setObservableObjectInstanceProperty(adm, key, descriptor);
	}
	return target;
}
