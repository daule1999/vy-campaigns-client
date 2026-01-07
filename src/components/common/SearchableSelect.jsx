import { Autocomplete, TextField, CircularProgress } from '@mui/material';

export default function SearchableSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  multiple = false,
  labelKey = 'name',
  valueKey = 'id',
  disabled = false,
  loading = false,
  ...props
}) {
  // Helper to get option value
  const getOptionValue = (option) => {
    return typeof option === 'string' ? option : option[valueKey];
  };

  // Helper to get option label
  const getOptionLabel = (option) => {
    return typeof option === 'string' ? option : option[labelKey] || '';
  };

  // Find selected option object(s) based on value(s)
  const getSelectedOptions = () => {
    if (multiple) {
      return options.filter(opt => {
        const val = getOptionValue(opt);
        return Array.isArray(value) && value.includes(val);
      });
    } else {
      return options.find(opt => getOptionValue(opt) === value) || null;
    }
  };

  const handleChange = (event, newValue) => {
    if (multiple) {
      onChange(newValue.map(opt => getOptionValue(opt)));
    } else {
      onChange(newValue ? getOptionValue(newValue) : null);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={getSelectedOptions()}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, val) => getOptionValue(option) === getOptionValue(val)}
      disabled={disabled}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={multiple && getSelectedOptions().length > 0 ? '' : placeholder}
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...props}
    />
  );
}
