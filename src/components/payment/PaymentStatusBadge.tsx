import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
    status: string;
    type?: 'payment' | 'release' | 'overall';
    size?: 'sm' | 'md' | 'lg';
}

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
    const getStatusConfig = () => {
        const configs = {
            // Payment statuses
            paid: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'Paid'
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                label: 'Pending'
            },
            failed: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                label: 'Failed'
            },
            created: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: AlertCircle,
                label: 'Created'
            },
            // Overall statuses
            advance_paid: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: CheckCircle,
                label: 'Advance Paid'
            },
            final_paid: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'Final Paid'
            },
            released: {
                color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                icon: CheckCircle,
                label: 'Released'
            },
            refunded: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                label: 'Refunded'
            },
            // Release statuses
            not_released: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                label: 'Not Released'
            }
        };

        return configs[status as keyof typeof configs] || {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: AlertCircle,
            label: status
        };
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-2 py-0.5 text-xs';
            case 'lg':
                return 'px-4 py-2 text-sm';
            default:
                return 'px-3 py-1 text-xs';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 'w-3 h-3';
            case 'lg':
                return 'w-5 h-5';
            default:
                return 'w-4 h-4';
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <span className={`
            inline-flex items-center gap-1 font-medium rounded-full border
            ${config.color} ${getSizeClasses()}
        `}>
            <Icon className={getIconSize()} />
            {config.label}
        </span>
    );
}
