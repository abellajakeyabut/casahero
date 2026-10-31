import {render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumberPicker from '../shared/NumberPicker'

const setup=(props)=>{
    const onChange = vi.fn();
    render(<NumberPicker label="Beds" value={2} onChange={onChange} {...props}/>)
    return {onChange,user:userEvent.setup()};
}
describe('Number of Beds Componenet',()=>{
    it('increase value when + is clicked', async()=>{
        const {onChange,user} = setup();
        await user.click(screen.getByRole('button',{name:  /increase/i}))
        expect(onChange).toHaveBeenCalledWith(3);
    })
    it('decrease value when - is clicked', async()=>{
        const {onChange,user} = setup();
        await user.click(screen.getByRole('button',{name:  /decrease/i}))
        expect(onChange).toHaveBeenCalledWith(1);
    })
    it('shows the label and value', ()=>{
        setup();
        expect(screen.getByText('Beds')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    })
    it('disables - at the minimum', ()=>{
        setup({ value: 1 });
        expect(screen.getByRole('button',{name: /decrease/i})).toBeDisabled();
    })
    it('disables + at the maximum', ()=>{
        setup({ value: 5, max: 5 });
        expect(screen.getByRole('button',{name: /increase/i})).toBeDisabled();
    })
})

describe('NumberPicker with allowAny',()=>{
    it('shows "Any" for null and disables -', ()=>{
        setup({ allowAny: true, value: null });
        expect(screen.getByText('Any')).toBeInTheDocument();
        expect(screen.getByRole('button',{name: /decrease/i})).toBeDisabled();
    })
    it('goes from "Any" to the minimum on +', async()=>{
        const {onChange,user} = setup({ allowAny: true, value: null, min: 1 });
        await user.click(screen.getByRole('button',{name: /increase/i}))
        expect(onChange).toHaveBeenCalledWith(1);
    })
    it('shows values as "n+"', ()=>{
        setup({ allowAny: true, value: 3 });
        expect(screen.getByText('3+')).toBeInTheDocument();
    })
    it('goes back to "Any" when decreasing from the minimum', async()=>{
        const {onChange,user} = setup({ allowAny: true, value: 1, min: 1 });
        await user.click(screen.getByRole('button',{name: /decrease/i}))
        expect(onChange).toHaveBeenCalledWith(null);
    })
})
