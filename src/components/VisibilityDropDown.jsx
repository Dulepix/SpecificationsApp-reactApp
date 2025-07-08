import React, { useEffect, useRef, useState } from 'react';

const VisibilityDropDown = ({ DashboardCss, selectedOption, setSelectedOption}) => {
    const [dropdownToggled, setDropdownToggled] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handler(e) {
            if(dropdownRef.current && !dropdownRef.current.contains(e.target)){
                setDropdownToggled(false)
            }
        }

        document.addEventListener('click', handler)

        return () => {
            document.removeEventListener('click', handler)
        }

    })

    const dropdownOptions = [
        {
            id: 0,
            value: "private",
        },
        {
            id: 1,
            value: "public"
        }
    ];
    return (
        <div ref={dropdownRef}>
            <button onClick={() => setDropdownToggled(!dropdownToggled)}>{selectedOption ? selectedOption.value : "Select Visibility"}</button>
            <div className={`${DashboardCss.options} ${dropdownToggled ? DashboardCss.visible : ""}`}>
                {dropdownOptions.map((option, index) => {
                    return (
                        <button onClick={() => {
                            setSelectedOption(option)
                            setDropdownToggled(false)
                        }} key={index}>{option.value}</button>
                    );
                })}
            </div>
        </div>
    );
};

export default VisibilityDropDown;
