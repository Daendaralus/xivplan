import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { Ellipse, Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { ALIGN_TO_PIXEL } from '../coord';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import {
    COLOR_MARKER_BLUE,
    COLOR_MARKER_PURPLE,
    COLOR_MARKER_RED,
    COLOR_MARKER_YELLOW,
    SELECTED_PROPS,
} from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { MarkerObject, ObjectType } from '../scene';
import { usePanelDrag } from '../usePanelDrag';
import { PrefabIcon } from './PrefabIcon';
import { ResizeableObjectContainer } from './ResizeableObjectContainer';
import { useShowHighlight } from './highlight';

const DEFAULT_SIZE = 42;
const ICON_RATIO = 32 / DEFAULT_SIZE;

function makeIcon(name: string, icon: string, shape: 'circle' | 'square', color: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = `./marker/${icon}`;

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Marker,
                            image: iconUrl,
                            name,
                            color,
                            shape,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

registerDropHandler<MarkerObject>(ObjectType.Marker, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Marker,
            name: '',
            image: '',
            shape: 'square',
            color: COLOR_MARKER_RED,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

function getDashSize(object: MarkerObject) {
    switch (object.shape) {
        case 'square':
            return (object.width + object.height) / 2 / 8;

        case 'circle': {
            const a = object.width / 2;
            const b = object.height / 2;
            const perimiter = 2 * Math.PI * Math.sqrt((a * a + b * b) / 2);
            return perimiter / 24;
        }
    }
}

interface OutlineProps {
    width: number;
    height: number;
    highlightWidth: number;
    highlightHeight: number;
    highlightOffset: number;
    showHighlight: boolean;
    strokeProps: ShapeConfig;
    dashSize: number;
}

const EllipseOutline: React.FC<OutlineProps> = ({
    width,
    height,
    highlightWidth,
    highlightHeight,
    showHighlight,
    strokeProps,
}) => {
    return (
        <>
            {showHighlight && (
                <Ellipse
                    x={width / 2}
                    y={height / 2}
                    radiusX={highlightWidth / 2}
                    radiusY={highlightHeight / 2}
                    {...SELECTED_PROPS}
                    opacity={0.25}
                />
            )}

            <Ellipse x={width / 2} y={height / 2} radiusX={width / 2} radiusY={height / 2} {...strokeProps} />
        </>
    );
};

const RectangleOutline: React.FC<OutlineProps> = ({
    width,
    height,
    highlightWidth,
    highlightHeight,
    highlightOffset,
    showHighlight,
    strokeProps,
    dashSize,
}) => {
    return (
        <>
            {showHighlight && (
                <Rect
                    x={-highlightOffset / 2}
                    y={-highlightOffset / 2}
                    width={highlightWidth}
                    height={highlightHeight}
                    {...SELECTED_PROPS}
                    {...ALIGN_TO_PIXEL}
                    opacity={0.25}
                />
            )}

            <Rect width={width} height={height} dashOffset={dashSize / 2} {...strokeProps} {...ALIGN_TO_PIXEL} />
        </>
    );
};

const MarkerRenderer: React.FC<RendererProps<MarkerObject>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [image] = useImage(object.image);

    const iconWidth = object.width * ICON_RATIO;
    const iconHeight = object.height * ICON_RATIO;
    const iconX = (object.width - iconWidth) / 2;
    const iconY = (object.height - iconHeight) / 2;

    const dashSize = getDashSize(object);
    const strokeProps = {
        stroke: object.color,
        strokeWidth: 1,
        shadowColor: object.color,
        shadowBlur: 2,
        dash: [dashSize, dashSize],
    };

    const highlightOffset = strokeProps.strokeWidth * 4;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {object.shape === 'circle' && (
                        <EllipseOutline
                            width={object.width}
                            height={object.height}
                            showHighlight={showHighlight}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                            strokeProps={strokeProps}
                            dashSize={dashSize}
                        />
                    )}
                    {object.shape === 'square' && (
                        <RectangleOutline
                            width={object.width}
                            height={object.height}
                            showHighlight={showHighlight}
                            highlightWidth={highlightWidth}
                            highlightHeight={highlightHeight}
                            highlightOffset={highlightOffset}
                            strokeProps={strokeProps}
                            dashSize={dashSize}
                        />
                    )}
                    <Image image={image} x={iconX} y={iconY} width={iconWidth} height={iconHeight} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<MarkerObject>(ObjectType.Marker, LayerName.Ground, MarkerRenderer);

const MarkerDetails: React.FC<ListComponentProps<MarkerObject>> = ({ object, isNested }) => {
    return <DetailsItem icon={object.image} name={object.name} object={object} isNested={isNested} />;
};

registerListComponent<MarkerObject>(ObjectType.Marker, MarkerDetails);

export const WaymarkA = makeIcon('Waymark A', 'waymark_a.png', 'circle', COLOR_MARKER_RED);
export const WaymarkB = makeIcon('Waymark B', 'waymark_b.png', 'circle', COLOR_MARKER_YELLOW);
export const WaymarkC = makeIcon('Waymark C', 'waymark_c.png', 'circle', COLOR_MARKER_BLUE);
export const WaymarkD = makeIcon('Waymark D', 'waymark_d.png', 'circle', COLOR_MARKER_PURPLE);
export const Waymark1 = makeIcon('Waymark 1', 'waymark_1.png', 'square', COLOR_MARKER_RED);
export const Waymark2 = makeIcon('Waymark 2', 'waymark_2.png', 'square', COLOR_MARKER_YELLOW);
export const Waymark3 = makeIcon('Waymark 3', 'waymark_3.png', 'square', COLOR_MARKER_BLUE);
export const Waymark4 = makeIcon('Waymark 4', 'waymark_4.png', 'square', COLOR_MARKER_PURPLE);
