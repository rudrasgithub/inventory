import { useState, useEffect, useCallback } from 'react';

export const useDraggableRows = (initialLayout, onLayoutSave) => {
  const [layout, setLayout] = useState(initialLayout);

  useEffect(() => {
    setLayout(initialLayout);
  }, [initialLayout]);

  const handleMouseDown = useCallback((e, cardId, rowType) => {
    e.preventDefault();
    const draggedElement = e.currentTarget;
    const container = draggedElement.parentElement;
    if (!container) return;

    draggedElement.classList.add('is-dragging');

    const initialPositions = new Map();
    const siblings = Array.from(container.children);
    siblings.forEach(child => {
      initialPositions.set(child, child.getBoundingClientRect());
    });
    initialPositions.set(container, container.getBoundingClientRect());

    const initialMouseX = e.clientX;

    const onMouseMove = (moveEvent) => {
      let deltaX = moveEvent.clientX - initialMouseX;
      const draggedItemInitialRect = initialPositions.get(draggedElement);
      const containerRect = initialPositions.get(container);
      const containerPadding = 16;

      const futureLeft = draggedItemInitialRect.left + deltaX;
      const futureRight = draggedItemInitialRect.right + deltaX;

      if (futureLeft < containerRect.left + containerPadding) {
        deltaX = (containerRect.left + containerPadding) - draggedItemInitialRect.left;
      }

      if (futureRight > containerRect.right - containerPadding) {
        deltaX = (containerRect.right - containerPadding) - draggedItemInitialRect.right;
      }

      const maxDeltaX = containerRect.width - draggedItemInitialRect.width - (containerPadding * 2);
      const minDeltaX = -(draggedItemInitialRect.left - containerRect.left - containerPadding);
      deltaX = Math.max(minDeltaX, Math.min(maxDeltaX, deltaX));

      draggedElement.style.transform = `translateX(${deltaX}px)`;

      const draggedCurrentRect = {
        left: draggedItemInitialRect.left + deltaX,
        right: draggedItemInitialRect.right + deltaX,
      };
      const draggedItemWidth = draggedItemInitialRect.width;
      const gap = 16;

      siblings.forEach(sibling => {
        if (sibling === draggedElement) return;
        const siblingInitialRect = initialPositions.get(sibling);
        const siblingWidth = siblingInitialRect.width;
        let translation = 0;

        if (draggedCurrentRect.right > siblingInitialRect.left && draggedCurrentRect.left < siblingInitialRect.right) {
          const requiredDisplacement = draggedItemWidth + gap;
          if (deltaX > 0 && siblingInitialRect.left > draggedItemInitialRect.left) {
            const overlap = draggedCurrentRect.right - siblingInitialRect.left;
            const overlapRatio = Math.min(overlap / siblingWidth, 1);
            translation = -overlapRatio * requiredDisplacement;
          } else if (deltaX < 0 && siblingInitialRect.left < draggedItemInitialRect.left) {
            const overlap = siblingInitialRect.right - draggedCurrentRect.left;
            const overlapRatio = Math.min(overlap / siblingWidth, 1);
            translation = overlapRatio * requiredDisplacement;
          }
        }
        sibling.style.transform = `translateX(${translation}px)`;
      });
    };

    const onMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      draggedElement.classList.remove('is-dragging');

      const container = draggedElement.parentElement;
      if (!container) return;

      const allElements = Array.from(container.children);

      allElements.forEach(child => {
        child.style.transition = 'transform 0.2s ease-in-out, left 0.2s ease-in-out';
        child.style.transform = '';
      });

      const getDragAfterElement = (container, x) => {
        const draggableElements = [...container.querySelectorAll('.draggable-card:not(.is-dragging)')];
        return draggableElements.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = x - box.left - box.width / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          }
          return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
      };

      const dropTarget = getDragAfterElement(container, upEvent.clientX);
      const currentOrder = layout[rowType];
      const draggedId = parseInt(draggedElement.dataset.cardId, 10);

      const otherItems = currentOrder.filter(id => id !== draggedId);

      const dropTargetId = dropTarget ? parseInt(dropTarget.dataset.cardId, 10) : null;
      const dropIndex = dropTargetId !== null ? otherItems.indexOf(dropTargetId) : otherItems.length;

      const newOrder = [...otherItems];
      newOrder.splice(dropIndex, 0, draggedId);

      const newLayout = { ...layout, [rowType]: newOrder };

      setLayout(newLayout);
      onLayoutSave(newLayout);

      setTimeout(() => {
        allElements.forEach(child => {
          if (child) {
            child.style.transition = '';
          }
        });
      }, 200);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [layout, onLayoutSave]);

  return { layout, handleMouseDown };
};
