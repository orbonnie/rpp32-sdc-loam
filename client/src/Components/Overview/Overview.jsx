import React from 'react';
import axios from 'axios';
import Gallery from './Gallery.jsx'
import Description from './Description.jsx';
import Styles from './Styles.jsx';
import Cart from './Cart.jsx';
import Modal from './Modal.jsx';
import $ from 'jquery';

class Overview extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentPhoto: 0,
      currentStyle: 0,
      prevPhoto: '',
      photo: '',
      nextPhoto: '',
      styles: [],
      productInfo: [],
      maxLength: 0,
      inventory: [],
      cart: [],
      modalOn: false
    }
    this.changePhoto = this.changePhoto.bind(this);
    this.changeStyle = this.changeStyle.bind(this);
    this.addToCart = this.addToCart.bind(this)
    this.toggleModal = this.toggleModal.bind(this);
  }

  addToCart(cartState) {
    var newCart = this.state.cart.slice();
    newCart.push(cartState);
    this.setState({ cart: newCart })
  }

  changePhoto(event) {
    var currentPhotoIndex = this.state.currentPhoto
    var max = this.state.maxLength;
    if (event.target.id === 'forward') {
      if (this.state.currentPhoto < max - 1) {
        this.setState({ prevPhoto: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex].url })
        this.setState({ photo: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex + 1].url })
        this.setState({ nextPhoto: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex + 2].url ? this.state.styles[this.state.currentStyle].photos[currentPhotoIndex + 2].url : this.state.styles[this.state.currentStyle].photos[0].url })
        this.setState({ currentPhoto: currentPhotoIndex + 1 })
      } else {
        this.setState({ photo: this.state.styles[this.state.currentStyle].photos[0].url });
        this.setState({ currentPhoto: 0 })
      }
    } else if (event.target.id === 'back') {
      if (this.state.currentPhoto > 0) {
        this.setState({ currentPhoto: currentPhotoIndex - 1 })
        this.setState({ prevPhoto: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex - 2].url? this.state.styles[this.state.currentStyle].photos[currentPhotoIndex - 2].url : this.state.styles[this.state.currentStyle].photos[max - 1].url })
        this.setState({ photo: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex - 1].url? this.state.styles[this.state.currentStyle].photos[currentPhotoIndex - 1].url : his.state.styles[this.state.currentStyle].photos[0].url })
        this.setState({ nextPhoto: this.state.styles[this.state.currentStyle].photos[currentPhotoIndex].url })
      } else {
        this.setState({ photo: this.state.styles[this.state.currentStyle].photos[max - 1].url });
        this.setState({ currentPhoto: max - 1 })
      }
    } else {
      this.setState({prevPhoto: this.state.styles[this.state.currentStyle].photos[Number.parseInt(event.target.id) - 1].url ? this.state.styles[this.state.currentStyle].photos[Number.parseInt(event.target.id) - 1].url : this.state.styles[this.state.currentStyle].photos[0].url});
      this.setState({photo: this.state.styles[this.state.currentStyle].photos[Number.parseInt(event.target.id)].url});
      this.setState({nextPhoto: this.state.styles[this.state.currentStyle].photos[Number.parseInt(event.target.id) + 1].url ? this.state.styles[this.state.currentStyle].photos[Number.parseInt(event.target.id) + 1].url : this.state.styles[this.state.currentStyle].photos[max - 1].url});
      this.setState({ currentPhoto: Number.parseInt(event.target.id)});
    }
  }

  toggleModal() {
    if (this.state.modalOn === true) {
      this.setState({ modalOn: false })
      $('html body').css({ overflow: 'visible' });
      $('html body').removeClass('ov-removeMargin');
      $('.ov-changePhoto').css({ visibility: 'visible' });
    } else {
      this.setState({ modalOn: true })
      $('html body').css({ overflow: 'hidden' });
      $('html body').addClass('ov-removeMargin');
      $('.ov-changePhoto').css({ visibility: 'hidden' });
    }
  }

  changeStyle(event) {
    var checkmark = '<span class="fa fa-check ov-checkmark"></span>';
    var id = Number.parseInt(event.target.id);
    //add checkmark to current style
    $('.fa-check').remove();
    $('#' + event.target.id).after(checkmark);
    this.setState({ currentStyle: id })
    this.setState({ prevPhotoUrl: this.state.styles[id].photos[prevPhotoId].url })
    this.setState({ currentPhotoUrl: this.state.styles[id].photos[currentPhotoId].url })
    this.setState({ nextPhotoUrl: this.state.styles[id].photos[nextPhotoId].url })
    this.setState({ inventory: this.state.styles[id].skus })
  }


  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = this.props.token
    axios.get(this.props.apiUrl + '/products/' + this.props.currentProduct + '/styles')
      .then((results) => {
        //set photos to API results at current index at photos array at current style index
        this.setState({ prevPhoto: results.data.results[0].photos[results.data.results[0].photos.length - 1].url })
        this.setState({ photo: results.data.results[0].photos[0].url })
        this.setState({ nextPhoto: results.data.results[0].photos[1].url })
        this.setState({ styles: results.data.results });
        this.setState({ inventory: results.data.results[0].skus })
        this.setState({ maxLength: results.data.results.map(id => id.photos).length })
      });
    axios.get(this.props.apiUrl + '/products/' + this.props.currentProduct)
      .then((results) => {
        this.setState({ productInfo: results.data })
      });
  }

  render() {
    var modal;
    if (this.state.modalOn) {
      modal = <Modal trackClicks={this.props.trackClicks} productInfo={this.state.productInfo} photos={this.state.styles[this.state.currentStyle].photos} photo={this.state.photo} toggleModal={this.toggleModal} changePhoto={this.changePhoto} />
    } else {
      modal = null;
    }
    return (
      <div className='ov-main'>
        {modal}
        <div>
          <Gallery trackClicks={this.props.trackClicks} productInfo={this.state.productInfo} photo={this.state.photo} prevPhoto={this.state.prevPhoto} nextPhoto={this.state.nextPhoto} currentStyle={this.state.currentStyle} changePhoto={this.changePhoto} toggleModal={this.toggleModal} />
          <Styles trackClicks={this.props.trackClicks} thumbnails={this.state.styles.map(style => style.photos).map(arr => arr[0].thumbnail_url)} changeStyle={this.changeStyle} styles={this.state.styles} />
          <Cart trackClicks={this.props.trackClicks} inventory={Object.entries(this.state.inventory)} addToCart={this.addToCart} />
          <Description productInfo={this.state.productInfo} />
        </div>
      </div>
    )
  }
}

export default Overview;
