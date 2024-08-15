import React, { useState, useCallback, useEffect } from "react";
import Dropzone from "./Components/Dropzone";
import Arrow from "./Components/Arrow";
import "./App.css";

const App = () => {
  const [positions, setPositions] = useState({
    box1: {
      top: 50,
      left: 160,
      width: 200,
      height: 150,
      background: "#8c52ff",
    },
    box2: {
      top: 250,
      left: 160,
      width: 200,
      height: 150,
      background: "#5271ff",
    },
    box3: {
      top: 450,
      left: 160,
      width: 200,
      height: 150,
      background: "#ffbd59",
    },
  });

  const [initialPositions, setInitialPositions] = useState({
    box1: { top: 50, left: 160 },
    box2: { top: 250, left: 160 },
    box3: { top: 450, left: 160 },
  });

  const [isDragging, setIsDragging] = useState(null);
  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });
  const [resizing, setResizing] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [arrows, setArrows] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [dropZone, setDropZone] = useState({
    top: 0,
    left: window.innerWidth / 3,
    width: window.innerWidth / 2,
    height: window.innerHeight,
  });
  const [message, setMessage] = useState({
    boxName: "",
    content: "",
  });

  const longText = "ccccccccccccccccccccccccccccccccccn";

  const popUpMessage = (box) => {
    if (message.boxName === box) {
      setMessage((prevState) => ({
        ...prevState,
        boxName: "",
        content: "",
      }));
    } else {
      setMessage((prevState) => ({
        ...prevState,
        boxName: box,
        content: longText,
      }));
    }
  };

  useEffect(() => {}, [message]);

  const handleDisplayResize = (n) => {
    if (selectedBox === n) {
      setSelectedBox(null);
    } else {
      setSelectedBox(n);
    }
  };

  const handleMouseDown = (e, box) => {
    setIsDragging(box);
    setOffset({
      offsetX: e.clientX - positions[box].left,
      offsetY: e.clientY - positions[box].top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newTop = e.clientY - offset.offsetY;
      const newLeft = e.clientX - offset.offsetX;

      setPositions((prevPositions) => ({
        ...prevPositions,
        [isDragging]: {
          ...prevPositions[isDragging],
          top: newTop,
          left: newLeft,
        },
      }));

      setArrows((prevArrows) =>
        prevArrows.map((arrow) => {
          const { startBox, endBox, startPosition, endPosition } = arrow;
          const startCoords = calculateCoords(
            startBox === isDragging
              ? {
                  top: newTop,
                  left: newLeft,
                  width: positions[startBox].width,
                  height: positions[startBox].height,
                }
              : positions[startBox],
            startPosition
          );
          const endCoords = calculateCoords(
            endBox === isDragging
              ? {
                  top: newTop,
                  left: newLeft,
                  width: positions[endBox].width,
                  height: positions[endBox].height,
                }
              : positions[endBox],
            endPosition
          );
          return {
            ...arrow,
            startX: startCoords.x,
            startY: startCoords.y,
            endX: endCoords.x,
            endY: endCoords.y,
          };
        })
      );
    }

    if (resizing) {
      const deltaX = e.clientX - initialPosition.x;
      const deltaY = e.clientY - initialPosition.y;
      const newWidth = initialSize.width + deltaX;
      const newHeight = initialSize.height + deltaY;

      setPositions((prevPositions) => ({
        ...prevPositions,
        [resizing]: {
          ...prevPositions[resizing],
          width: newWidth,
          height: newHeight,
        },
      }));

      setArrows((prevArrows) =>
        prevArrows.map((arrow) => {
          const { startBox, endBox, startPosition, endPosition } = arrow;
          const startCoords = calculateCoords(
            startBox === resizing
              ? { ...positions[startBox], width: newWidth, height: newHeight }
              : positions[startBox],
            startPosition
          );
          const endCoords = calculateCoords(
            endBox === resizing
              ? { ...positions[endBox], width: newWidth, height: newHeight }
              : positions[endBox],
            endPosition
          );
          return {
            ...arrow,
            startX: startCoords.x,
            startY: startCoords.y,
            endX: endCoords.x,
            endY: endCoords.y,
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const box = isDragging;
      const { top, left } = positions[box];
      const {
        top: zoneTop,
        left: zoneLeft,
        width: zoneWidth,
        height: zoneHeight,
      } = dropZone;

      if (
        top < zoneTop ||
        left < zoneLeft ||
        top > zoneTop + zoneHeight ||
        left > zoneLeft + zoneWidth
      ) {
        setPositions((prevPositions) => ({
          ...prevPositions,
          [box]: {
            ...initialPositions[box],
            width: prevPositions[box].width,
            height: prevPositions[box].height,
          },
        }));
      }

      setIsDragging(null);
    }

    setResizing(null);
  };

  const handleResizeMouseDown = (e, box) => {
    e.stopPropagation();
    setResizing(box);
    setInitialSize({
      width: positions[box].width,
      height: positions[box].height,
    });
    setInitialPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handlePointClick = (box, position) => {
    if (!connecting) {
      setConnecting({ box, position });
    } else {
      if (connecting.box !== box || connecting.position !== position) {
        const startCoords = calculateCoords(
          positions[connecting.box],
          connecting.position
        );
        const endCoords = calculateCoords(positions[box], position);
        setArrows((prevArrows) => [
          ...prevArrows,
          {
            startBox: connecting.box,
            startPosition: connecting.position,
            endBox: box,
            endPosition: position,
            startX: startCoords.x,
            startY: startCoords.y,
            endX: endCoords.x,
            endY: endCoords.y,
          },
        ]);
      }
      setConnecting(null);
    }
  };

  const calculateCoords = (position, point) => {
    const { width, height } = position;

    switch (point) {
      case "top":
        return { x: position.left + width / 2, y: position.top };
      case "bottom":
        return { x: position.left + width / 2, y: position.top + height };
      default:
        return { x: position.left, y: position.top };
    }
  };

  return (
    <div
      className="relative h-screen w-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Section 1: Drop Zone */}
      <Dropzone />
      {/* Section 2: Box Display */}
      <div className="absolute top-0 left-0 w-1/3 bg-gray-200 shadow-2xl h-full p-4 border-r border-[1px] border-black border-gray-400">
        <p className="text-center text-bold">Drag The Card</p>
        {Object.keys(positions).map((box) => (
          <div
            key={box}
            className="absolute cursor-grab shadow-2xl"
            style={{
              top: `${positions[box].top}px`,
              left: `${positions[box].left}px`,
              width: `${positions[box].width}px`,
              height: `${positions[box].height}px`,
              backgroundColor: `${positions[box].background}`,
            }}
            onMouseDown={(e) => handleMouseDown(e, box)}
            onDoubleClick={() => handleDisplayResize(box)}
          >
            {box === message.boxName && (
              <div className="w-[500px] h-[50px] absolute top-[-70px] rounded-[5px] bg-blue-500 absolute shadow-2xl">
                {message.content}
              </div>
            )}

            {/* Top Point */}
            <div
              className="w-4 h-4 bg-white rounded-[40px] absolute cursor-pointer"
              style={{ top: "-8px", left: "calc(50% - 8px)" }}
              onClick={() => handlePointClick(box, "top")}
            />
            {/* Bottom Point */}
            <div
              className="w-4 h-4 bg-white rounded-[40px] absolute cursor-pointer"
              style={{ bottom: "-8px", left: "calc(50% - 8px)" }}
              onClick={() => handlePointClick(box, "bottom")}
            />
            {/* Resizer */}
            {selectedBox === box && (
              <div
                className="w-4 h-4 bg-gray-500 absolute cursor-se-resize"
                style={{ bottom: "-8px", right: "-8px" }}
                onMouseDown={(e) => handleResizeMouseDown(e, box)}
              />
            )}

            <h1 className="overflow-hidden cursor-pointer mt-[50px] text-center">
              {longText}
            </h1>

            <h1
              className="overflow-hidden cursor-pointer  text-center"
              onClick={() => popUpMessage(box)}
            >
              ....Show More
            </h1>
          </div>
        ))}
      </div>
      <Arrow arrows={arrows} />
    </div>
  );
};

export default App;
