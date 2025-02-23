#[test_only]
module strike::strike_tests;

use strike::strike;

use std::string::utf8;

#[test]
fun test_hello_world() {
    let actual = strike::hello_world();
    let expected = utf8(b"Hello World!");
    std::debug::print(&actual);
    std::debug::print(&expected);
    assert!(actual == expected, 0);
}
