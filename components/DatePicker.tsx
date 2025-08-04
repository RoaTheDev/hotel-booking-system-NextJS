"use client";
import * as React from 'react';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import {PickersDay, PickersDayProps} from '@mui/x-date-pickers/PickersDay';
import {isWeekend} from 'date-fns';
import '@mui/x-date-pickers/themeAugmentation';

const theme = createTheme({
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#ffffff !important',
                },
            },
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    backgroundColor: 'transparent',
                    color: '#ffffff !important',
                    '&.Mui-selected': {
                        backgroundColor: '#10b981 !important',
                        color: '#ffffff !important',
                    },
                    '&:hover': {
                        backgroundColor: '#475569 !important',
                        color: '#ffffff !important',
                    },
                },
            },
        },
        MuiPickersCalendarHeader: {
            styleOverrides: {
                root: {
                    color: '#f3f4f6',
                    fontWeight: 300,
                },
                label: {
                    color: '#f3f4f6',
                },
            },
        },
    },
});

interface CustomPickersDayProps extends PickersDayProps {
    isWeekend: boolean;
}

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'isWeekend',
})<CustomPickersDayProps>(({isWeekend}) => ({
    color: isWeekend ? '#ff0000 !important' : '#ffffff !important',
    '&.Mui-selected': {
        backgroundColor: '#10b981 !important',
        color: '#ffffff !important',
    },
    '&:hover': {
        backgroundColor: '#475569 !important',
        color: '#ffffff !important',
    },
}));

function CustomDay(props: PickersDayProps) {
    const {day, ...other} = props;
    const isWeekendDay = isWeekend(day as Date);

    return <CustomPickersDay {...other} day={day} isWeekend={isWeekendDay}/>;
}

interface ThemedDatePickerProps {
    value: Date | null;
    onChangeAction: (date: Date | null) => void;
    label?: string;
    format?: string;
}

export default function ThemedDatePicker({
                                             value,
                                             onChangeAction,
                                             label = 'Select Date',
                                             format = 'dd/MM/yyyy',
                                         }: ThemedDatePickerProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
                <DatePicker
                    label={label}
                    value={value}
                    onChange={onChangeAction}
                    format={format}
                    slots={{
                        day: CustomDay,
                    }}
                    slotProps={{
                        popper: {
                            sx: {
                                '& .MuiPaper-root': {
                                    backgroundColor: '#1e293b',
                                    color: '#f3f4f6',
                                    border: '1px solid #475569',
                                    borderRadius: '0.5rem',
                                },
                            },
                        },
                        textField: {
                            sx: {
                                '& .MuiInputBase-input': {
                                    color: '#f3f4f6',
                                    padding: '0.5rem',
                                    fontSize: '0.875rem',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#94a3b8',
                                    fontWeight: 300,
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#10b981',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#475569',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#10b981',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#10b981',
                                    },
                                },
                            },
                            variant: 'outlined',
                            className:
                                'bg-slate-700/50 border-slate-600 text-slate-100 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300 w-full',
                            InputProps: {
                                style: {
                                    color: '#f3f4f6',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 300,
                                    borderColor: '#475569',
                                    borderRadius: '0.5rem',
                                },
                            },
                        },
                    }}
                />
            </ThemeProvider>
        </LocalizationProvider>
    );
}
