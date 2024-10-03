import PropTypes from 'prop-types';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSearchFilter } from 'src/context/SearchFilterContext';
// components
import Logo from 'src/components/logo';
import CreateForm from 'src/sections/create/create-dialog';
import { useSettingsContext } from 'src/components/settings';
import SearchBar from 'src/components/search-bar';
import TabsComponent from 'src/components/tabs';
//
import { HEADER, NAV } from '../config-layout';

// ----------------------------------------------------------------------

export default function Header({ onOpenNav  }) {
  const theme = useTheme();
  const { filters, handleFilterPublish, setSearchQuery, filteredMyStatsLength,  filteredStatsLength } = useSearchFilter();  

  const settings = useSettingsContext();
  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const renderContent = (
    <>
      {/* {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />} */}

      {/* {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )} */}

      <Logo />
      <Stack
        direction="row"               
        justifyContent="center"        
        alignItems="center"            
        sx={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '100%',
          marginLeft: '20px',
          gap: '30px',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            marginRight:'10%',
            paddingLeft:'10%',
            width: '100%', 
            gap: '10%',
          }}
        >
          <CreateForm/>
          <TabsComponent
            filters={filters}
            handleFilterPublish={handleFilterPublish}
            filteredStatsLength={filteredStatsLength}
            filteredMyStatsLength={filteredMyStatsLength}
          />
          <SearchBar onSearch={handleSearch} />
        </Stack>
      </Stack>
 
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* Right-hand side content */}
    
        
        {/* <LanguagePopover /> */}

        {/* <NotificationsPopover /> */}

        {/* <ContactsPopover /> */}
        {/* <BaseOptions
          value='dark'
          onChange={(newValue) => settings.onUpdate('themeMode', newValue)}
          options={['light', 'dark']}
          icons={['sun', 'moon']}
        /> */}
        {/* <SettingsButton /> */}

        <w3m-button />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `100%`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
