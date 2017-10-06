import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import Main from '../src/main.js';

describe('<Main>', function() {
    it('basic test', function() {
	const obj = mount(<Main />);
	expect(obj).to.not.be.null;
    })
})
