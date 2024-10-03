import { readContract } from '@wagmi/core';
import { erc20Abi } from 'viem';

import { config } from 'src/config';

import moduleAbi from '../../../constant/module.json';

export const fetchModuleInfo = async (moduleAddress, tokenAddress, address) => {
  try {
    if (address) {
      const data1 = await readContract(config, {
        address: moduleAddress,
        abi: moduleAbi,
        functionName: 'getUserStaked',
        args: [address],
      });

      const data2 = await readContract(config, {
        address: moduleAddress,
        abi: moduleAbi,
        functionName: 'earned',
        args: [address],
      });

      const data3 = await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      });

      const userStaked = Number((Number(data1) / 10 ** 18).toFixed(2));
      const userRewards = Number((Number(data2) / 10 ** 18).toFixed(2));
      const tokenBalance = Number((Number(data3) / 10 ** 18).toFixed(2));

      return { userStaked, userRewards, tokenBalance };
    }

    return { userStaked: 0, userRewards: 0, tokenBalance: 0 };

  } catch (e) {
    console.log('fetch module info failure', e);
    return { userStaked: 0, userRewards: 0, tokenBalance: 0 };
  }
};
