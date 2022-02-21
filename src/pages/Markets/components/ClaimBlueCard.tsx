import styled from "styled-components"
import BlueBgImg from 'images/BlueBgImg.png'
import { FormattedMessage } from 'react-intl'
import BlueApy from 'components/Card/BlueApy'
import { Statistic } from 'antd'
import Button from 'components/Button'
import { useRef, useEffect, useState } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { usePossumSingerContract } from 'hooks/useContract'
import { getBalanceByTokenAddress, trancheParameters } from 'hooks/useContractMethods'
import ClaimModal from 'components/Modal/ClaimModal'
import { TrancheParameters } from 'state/types'
import PenddingModal from 'components/Modal/PenddingModal'
import { useAppSelector } from 'state/hooks'

const CardBox = styled.div`
    position: relative;
    background: url(${BlueBgImg}) no-repeat;
    background-size: 100% 100%;
    width: 525px;
    height: 676px;
    .blueCard {
        color: var(--butBorderColor);
    }
`

const CardTitle = styled.div`
    position: absolute;
    font-size: 30px;
    font-family: DINPro-Bold, DINPro;
    font-weight: bold;
    left: 50%;
    top: 55px;
    transform: translate(-50%, -50%);/*相对于自己的百分比*/
`

const CardContent = styled.div`
    width: 100%;
    height: 100%;
    padding: 20px 70px;
    margin-top: 100px;
`

const AmountShareBox = styled.div`
    margin-top: 10px;
    margin-left: 30px;
    margin-right: 30px;
    .ant-statistic {
        .ant-statistic-content {
            .ant-statistic-content-prefix {
                font-size: 26px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: var(--whiteColor);
            }
            .ant-statistic-content-suffix {
                font-size: 26px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: var(--whiteColor);
            }
            .ant-statistic-content-value {
                .ant-statistic-content-value-decimal,
                .ant-statistic-content-value-int {
                    font-size: 26px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: var(--whiteColor);
                }
            }
        } 
    }
`

const AmountBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    line-height: 50px;
    margin-top: 40px;
    .label {
        font-size: 18px;
        font-family: DINPro-Medium, DINPro;
        font-weight: 500;
        color: #979FB5;
    }
`

const ButtonBox = styled.div`
    margin: 30px;
`

const ClaimBlueCard = (props: any) => {
    const type:string = 'FixClaim'
    const claimModalRef: any = useRef()
    const penddingModalRef: any = useRef()
    const possumContract = usePossumSingerContract()
    const [aTokenBalance, setATokenBalance] = useState(0)
    const [bTokenBalance, setBTokenBalance] = useState(0)
    const [aTokenPrice, setATokenPrice] = useState(0)
    const [bTokenPrice, setBTokenPrice] = useState(0)
    const bTrancheAddress = props.bTrancheAddress || ''
    const aTrancheAddress = props.aTrancheAddress || ''
    const pid = props.pid || 0

    const { library, account, chainId } = useActiveWeb3React()

    const openModal: boolean = useAppSelector((state) => state.application.openModal)
    useEffect(() => {
        if (!openModal) {
            fetchBalance()
        }
    }, [!openModal])

    const fetchBalance = async () => {
        const aRes = await getBalanceByTokenAddress(possumContract, aTrancheAddress, account)
        const bRes = await getBalanceByTokenAddress(possumContract, bTrancheAddress, account)
        const trancheParametersRes: TrancheParameters | null = await trancheParameters(possumContract, pid)
        if (trancheParametersRes) {
            setATokenPrice(trancheParametersRes?.storedTrancheAPrice)
            setBTokenPrice(trancheParametersRes?.storedTrancheBPrice)
        }
        setATokenBalance(aRes.balance)
        setBTokenBalance(bRes.balance)
    }

    useEffect(() => {
        if (chainId && account && library) {
            fetchBalance()
        }
    }, [library, account, chainId])

    const onButClick = (type:string) => {
        claimModalRef.current.updateData({
            visible: true,
            logoUrl: props.logoUrl,
            aTokenPrice,
            bTokenPrice,
            aTokenBalance,
            bTokenBalance,
            name: props.name,
            productTitle: props.productTitle,
            productEpoch: props.productEpoch,
            pid: props.pid,
            type,
            lockPeriod: props.lockPeriod,
            aTokenAddress: aTrancheAddress,
            bTokenAddress: bTrancheAddress
        })
    }

    const updateStatus = (type: number) => {
        if (type === 0) {
            penddingModalRef.current.updateData({
                title: 'Claim',
                visible: true,
                content: 'Claim Fail',
                tradeStatus: 0 // 交易失败
            })
        } else if (type === 2) {
            penddingModalRef.current.updateData({
                title: 'Claim',
                visible: true,
                content: 'Loading...',
                tradeStatus: 2 // 交易等待中
            })
        }
    }

    return (
        <CardBox>
            <CardTitle className="blueCard">
                <FormattedMessage id='card.title.fix' defaultMessage="" values={{name: ''}} />
            </CardTitle>

            <CardContent>
                <BlueApy title='Fixed APY' apy={props.fixedApy} tip='APY that Fixed Pool adopted which was fixed from the beginning' />

                <AmountShareBox>
                    <AmountBox>
                        <div className="label">Total Value:</div>
                        <Statistic value={props.symbolADepositedBalance} precision={2} suffix="" />
                    </AmountBox>

                    {/* <AmountBox>
                        <div className="label">Your Share:</div>
                        <Statistic value={useBalance} precision={2} suffix="" />
                    </AmountBox>

                    <AmountBox>
                        <div className="label">Avaliable:</div>
                        <Statistic value='623137' precision={2} suffix="" />
                    </AmountBox> */}
                </AmountShareBox>

                <ButtonBox>
                    <Button text='Claim All' type={type} onButClick={(type) => onButClick(type)} />
                </ButtonBox>
            </CardContent>
            <ClaimModal onRef={claimModalRef} updateStatus={(type: number) => updateStatus(type)} />

            <PenddingModal onRef={penddingModalRef} />
        </CardBox>
    )
}

export default ClaimBlueCard