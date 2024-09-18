import * as Yup from 'yup';

import { useAccount, useChainId } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { config } from 'src/config';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import moduleAbi from '../../constant/module.json';

export default function UserAction({ stats, setUpdater, moduleAddress }) {
  const { enqueueSnackbar } = useSnackbar();
  const { address } = useAccount();
  const NewUserSchema = Yup.object().shape({
    staking: Yup.number()
      .min(0.000000000000000001, 'staking must not be below 0')
      .required('staking is required'),
  });
  const defaultValues = {
    staking: 0,
  };
  const dialog = useBoolean();
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    getValues,
    trigger,
    formState: { isSubmitting },
  } = methods;
  const handleStake = async () => {
    try {
      if (address) {
        const validation = await trigger();
        if (validation) {
          const forms = getValues();
          if (forms.staking <= stats.tokenBalance) {
            const para = [forms.staking * 10 ** 18];
            const result = await writeContract(config, {
              abi: moduleAbi,
              address: moduleAddress,
              functionName: 'stake',
              args: para,
            });
            const response = await waitForTransactionReceipt(config, { hash: result });
            if (response != null) {
              if (response && response.status && response.status === 'success') {
                enqueueSnackbar('Staked successfully!', { variant: 'success' });
                dialog.onFalse();
                setUpdater(new Date());
              }
            }
          } else {
            enqueueSnackbar(`Don't have enough ${stats.moduleInfo.symbol} in your wallet!`, {
              variant: 'error',
            });
          }
        }
      } else {
        enqueueSnackbar('Please connect wallet!', {
          variant: 'info',
        });
      }
    } catch (e) {
      if (e.message.includes('User rejected the request'))
        enqueueSnackbar(`User rejected the request!`, {
          variant: 'info',
        });
    }
  };
  const handleUnStake = async () => {
    try {
      if (address) {
        const validation = await trigger();
        if (validation) {
          const forms = getValues();
          if (forms.staking <= stats.userStaked) {
            const para = [forms.staking * 10 ** 18];
            const result = await writeContract(config, {
              abi: moduleAbi,
              address: moduleAddress,
              functionName: 'unStake',
              args: para,
            });
            const response = await waitForTransactionReceipt(config, { hash: result });
            if (response != null) {
              if (response && response.status && response.status === 'success') {
                enqueueSnackbar('UnStaked successfully!', { variant: 'success' });
                dialog.onFalse();
                setUpdater(new Date());
              }
            }
          } else {
            enqueueSnackbar(`Don't have enough ${stats.moduleInfo.symbol} staked in this module!`, {
              variant: 'error',
            });
          }
        }
      } else {
        enqueueSnackbar('Please connect wallet!', {
          variant: 'info',
        });
      }
    } catch (e) {
      if (e.message.includes('User rejected the request'))
        enqueueSnackbar(`User rejected the request!`, {
          variant: 'info',
        });
    }
  };
  const handleClaim = async () => {
    try {
      if (address) {
        const result = await writeContract(config, {
          abi: moduleAbi,
          address: moduleAddress,
          functionName: 'claimReward',
        });
        const response = await waitForTransactionReceipt(config, { hash: result });
        if (response != null) {
          if (response && response.status && response.status === 'success') {
            enqueueSnackbar('Claimed successfully!', { variant: 'success' });
            setUpdater(new Date());
          }
        }
      } else {
        enqueueSnackbar('Please connect wallet!', {
          variant: 'info',
        });
      }
    } catch (e) {
      if (e.message.includes('User rejected the request'))
        enqueueSnackbar(`User rejected the request!`, {
          variant: 'info',
        });
    }
  };

  return (
    <>
      <Stack direction="row">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Your Staked
        </Typography>

        <Typography variant="subtitle2">
          {stats.userStaked} {stats.moduleInfo.symbol}
        </Typography>
      </Stack>
      <Stack direction="row">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Your Accumulated Rewards
        </Typography>

        <Typography variant="subtitle2">
          {stats.userRewards} {stats.moduleInfo.symbol}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          disabled={Number(stats.userRewards) === 0}
          size="large"
          color="warning"
          variant="contained"
          // startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
          onClick={handleClaim}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Claim Rewards
        </Button>

        <Button fullWidth size="large" variant="contained" onClick={dialog.onTrue}>
          Stake/Unstake
        </Button>
        <Dialog open={dialog.value} onClose={dialog.onFalse}>
          {isSubmitting && (
            <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
              <CircularProgress color="primary" />
            </Backdrop>
          )}
          <FormProvider methods={methods}>
            <DialogTitle p={3}>Stake/Unstake</DialogTitle>

            <DialogContent>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                }}
                pt={2}
              >
                <RHFTextField
                  name="staking"
                  label="Staking/UnStaking amount"
                  sx={{ width: '400px' }}
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={dialog.onFalse} variant="outlined" color="inherit">
                Cancel
              </Button>
              <LoadingButton
                // type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
                onClick={handleStake}
              >
                Stake
              </LoadingButton>
              <LoadingButton
                // type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
                onClick={handleUnStake}
              >
                UnStake
              </LoadingButton>
            </DialogActions>
          </FormProvider>
        </Dialog>
      </Stack>
    </>
  );
}
