import React from 'react'
import { Task } from "./Task";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function DndContextSection({DashboardCss, data, setData}) {
    const handleDragEnd = (event) => {
      const {active, over} = event;
      if (active.id === over.id) return;
      setData((prevData) => {
        const originalPos = data.findIndex(item => item.ProductSizeId === active.id);
        const newPos = data.findIndex(item => item.ProductSizeId === over.id);

        return arrayMove(data, originalPos, newPos)
      })
    }
  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners} modifiers={[restrictToParentElement]}>
                  <div className={DashboardCss.column}>
                    <SortableContext items={data.map(item => item.ProductSizeId)} strategy={verticalListSortingStrategy}>
                      {data.map((item) => (
                        <Task key={item.ProductSizeId} DashboardCss={DashboardCss}  Product={item.Product} Sizes={item.Sizes} ProductSizeId={item.ProductSizeId} Index={data.findIndex(p => p.ProductSizeId === item.ProductSizeId) + 1} Data={data} setData={setData} />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>
  )
}

export default DndContextSection