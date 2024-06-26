import { ISpinButtonProps, SpinButton } from '@fluentui/react';
import React, { useCallback } from 'react';

export interface SpinButtonUnitsProps extends ISpinButtonProps {
    suffix?: string;
}

const VALUE_REGEX = /^(-?\d+(\.\d+)?).*/;

function getNumericPart(value: string): number {
    const match = value.match(VALUE_REGEX);
    if (match) {
        const numericValue = Number(match[1]);
        return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
}

function getChangeValue(value?: string): string | undefined {
    if (value === undefined) {
        return undefined;
    }

    return getNumericPart(value)?.toString();
}

export const SpinButtonUnits: React.FC<SpinButtonUnitsProps> = ({ suffix, ...props }) => {
    const step = props.step ?? 1;
    const value = props.value ?? '0';
    suffix = !props.value ? '' : suffix ?? '';

    const clamp = useCallback(
        (value: number) => {
            if (props.min !== undefined) {
                value = Math.max(value, props.min);
            }
            if (props.max !== undefined) {
                value = Math.min(value, props.max);
            }
            return value;
        },
        [props.min, props.max],
    );

    const onIncrement = useCallback(
        (value: string) => {
            const numericValue = getNumericPart(value);
            return clamp(numericValue + step).toString() + suffix;
        },
        [step, suffix, clamp],
    );

    const onDecrement = useCallback(
        (value: string) => {
            const numericValue = getNumericPart(value);
            return clamp(numericValue - step).toString() + suffix;
        },
        [step, suffix, clamp],
    );

    const onValidate = useCallback(
        (value: string) => {
            const numericValue = getNumericPart(value);
            return clamp(numericValue).toString() + suffix;
        },
        [suffix, clamp],
    );

    const onChange = useCallback(
        (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
            props.onChange?.(event, getChangeValue(newValue));
        },
        [props],
    );

    return (
        <SpinButton
            {...props}
            value={value + suffix}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onValidate={onValidate}
            onChange={onChange}
        />
    );
};
