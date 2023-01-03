import React from 'react';
import DateTimePicker from "react-datetime-picker";
import './DatePicker.scss';

interface props {
	onChange: any;
	value: Date;
}

function DatePicker(props: props) {
	return (
		<>
			<DateTimePicker
				disableClock={true}
				clearIcon={null}
				format="dd/MM/y - h:mm a"
				dayPlaceholder="DD"
				monthPlaceholder="MM"
				yearPlaceholder="Y"
				minutePlaceholder="Minute"
				hourPlaceholder="Hour"
				closeWidgets={false}
				locale="en"
				minDate={new Date()}
				onChange={props.onChange}
				value={props.value}

				className="datePicker"
				required />
		</>
	);
};
export default DatePicker;