import React from 'react';
import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const Task = ({ DashboardCss, ProductSizeId, Product, Sizes, Index, Quantity, Data, setData}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
  useSortable({ id: ProductSizeId });

  const currentItem = Data.find(item => item.ProductSizeId === ProductSizeId); 

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: 'grab',
    border: isDragging ? '1px solid #919191ff' : '1px solid #ffffff',
  };

  const modifiedListeners = {
    ...listeners,
    onPointerDown: (event) => {
      if (event.target.tagName === 'INPUT' || event.target.closest('input')) {
        event.stopPropagation(); 
        return;
      }
      if (listeners.onPointerDown) listeners.onPointerDown(event);
    },
    onPointerMove: listeners.onPointerMove,
    onPointerUp: listeners.onPointerUp,
    onPointerCancel: listeners.onPointerCancel,
  };

   const handleCheckboxClick  = useCallback((e) => {
      const isChecked  = e.target.checked;
      const ctrlPressed = e.ctrlKey || e.metaKey;

      setData((prevData) =>
        prevData.map((item) => {
          if (ctrlPressed) 
            return item.ProductSizeId === ProductSizeId ? { ...item, Checked: isChecked } : item;
          return item.ProductSizeId === ProductSizeId ? { ...item, Checked: isChecked } : { ...item, Checked: false };
        })
      );
    }, [ProductSizeId, setData]);

    const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
      setData((prevData) =>
        prevData.map((item) => {
          if (item.ProductSizeId === ProductSizeId) {
            return { ...item, Quantity: newQuantity };
          }
          return item;
        })
      );
    }

  return (
    <div ref={setNodeRef} {...attributes} {...modifiedListeners} style={style} className={DashboardCss.task}> 
      <span><input type='checkbox' checked={currentItem.Checked} onClick={(e) => handleCheckboxClick(e)} readOnly/><p>{Index}. {Product} {Sizes}</p></span>
      <input type='text' value={Quantity} onChange={(e) => handleQuantityChange(e)}/>
    </div>
  );
};
