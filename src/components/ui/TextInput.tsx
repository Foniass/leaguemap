"use client";

import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

// Define the prop types for the component, currently empty as no props are passed to the component
type TextInputProps = {
	value: string | number;
	setValue: Dispatch<SetStateAction<string>> | ((value: string) => void);
	className?: string;
};

const defaultValue = "Indéfini";

const TextInput: FC<TextInputProps> = ({ value, setValue, className }) => {
	const [wantChangeValue, setWantChangeValue] = useState(false);
	const spanRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		if (value === "") setValue(defaultValue);
	}, [setValue, value]);

	useEffect(() => {
		if (wantChangeValue && spanRef.current) {
			const span = spanRef.current;
			span.focus();
			const range = document.createRange();
			range.selectNodeContents(span);
			range.collapse(false);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
		}
	}, [wantChangeValue]);

	const closeSpan = useCallback(() => {
		if (spanRef.current) setValue(spanRef.current.textContent || defaultValue);
		setWantChangeValue(false);
	}, [setValue]);

	return (
		<>
			{wantChangeValue ? (
				<span
					className={className + " underline focus:outline-none"}
					contentEditable={true}
					ref={spanRef}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === "Tab") {
							e.preventDefault();
							closeSpan();
						}
					}}
					onBlur={() => {
						closeSpan();
					}}
				>
					{typeof value === "number" ? Math.floor(value) : value}
				</span>
			) : (
				<span onClick={() => setWantChangeValue(true)} className={className + " hover:cursor-pointer"}>
					{typeof value === "number" ? Math.floor(value) : value}
				</span>
			)}
		</>
	);
};

export default TextInput;
