import { Wallet, DirectionsBusFilled, QrCode, Atm, CreditCard } from '@mui/icons-material';

export const PaymentMethods = [
  {
    value: 'payos',
    icon: <QrCode color="primary" />,
    label: 'QR Chuyển khoản / Ví điện tử',
    description:
      'Không cần nhập thông tin. Xác nhận thanh toán tức thì, nhanh chóng và ít sai sót.',
  },
  {
    value: 'momo',
    icon: <Wallet color="secondary" />,
    label: 'Ví MoMo',
    description: 'Thanh toán qua ứng dụng MoMo.',
  },
  {
    value: 'international-card',
    icon: <CreditCard color="action" />,
    label: 'Thẻ Quốc tế',
    description: 'Thẻ Visa, MasterCard, JCB.',
  },
  {
    value: 'cash',
    icon: <DirectionsBusFilled color="primary" />,
    label: 'Thanh toán tại nhà xe',
    description:
      'Bạn phải ra văn phòng nhà xe và thanh toán cho nhân viên tại quầy để lấy vé trước.',
  },
  {
    value: 'domestic-card',
    icon: <Atm color="primary" />,
    label: 'Thẻ Nội địa',
    description: 'Tài khoản phải có Internet Banking.',
  },
];
